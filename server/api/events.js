import mongoose from 'mongoose';
import moment from 'moment-timezone';
import {
  getSession, allowAnyone, authorizedForDomain, requireSomeAdministrator,
} from './auth';
import { unsetDomainIfNeeded } from './domains';
import { unsetCalendarIfNeeded } from './calendars';
import { addForms, addNewForm } from './formTemplates';
import register from './register';
import { catcher, sendImage } from './utils';

mongoose.Promise = global.Promise;

// /api/events

// Supporting functions for /events/resources

function eventMoments(event) {
  let result = [{
    start: moment(event.start).subtract(event.setup || 0, 'minutes'),
    end: moment(event.end).add(event.teardown || 0, 'minutes'),
  }];
  if (event.times) {
    result = result.concat(event.times.map(time => ({
      start: moment(time.start).subtract(event.setup || 0, 'minutes'),
      end: moment(time.end).add(event.teardown || 0, 'minutes'),
    })));
  }
  if (event.dates) {
    const recurrence = [];
    event.dates.forEach((date) => {
      result.forEach((time) => {
        recurrence.push({
          start: moment(date).set({
            hour: time.start.hour(),
            minute: time.start.minute(),
          }).subtract(event.setup || 0, 'minutes'),
          end: moment(date).set({
            hour: time.end.hour(),
            minute: time.end.minute(),
          }).add(event.teardown || 0, 'minutes'),
        });
      });
    });
    result = result.concat(recurrence);
  }
  return result;
}

function overlapsMoments(event, moments) {
  const moments2 = eventMoments(event);
  return moments.some(moment1 => (
    moments2.some(moment2 => (
      moment1.end.isAfter(moment2.start) &&
      moment1.start.isBefore(moment2.end)
    ))
  ));
}

function overlappingEvents(event) {
  const Event = mongoose.model('Event');
  const moments = eventMoments(event);
  return Event.find({ _id: { $ne: event._id } }).exec()
    .then(events => events.filter(event2 => overlapsMoments(event2, moments)));
}

function resourceIdsWithEvents(events) {
  const resourceIdsEvents = {}; // _id => [{ _id: <event id>, name: <event name }]
  events.forEach((event2) => {
    if (event2.resourceIds) {
      event2.resourceIds.forEach((resourceId) => {
        const stringId = resourceId.toString();
        if (!resourceIdsEvents[stringId]) {
          resourceIdsEvents[stringId] = [];
        }
        resourceIdsEvents[stringId].push(
          { _id: event2._id, name: event2.name },
        );
      });
    }
  });
  return resourceIdsEvents;
}

function resourcesWithEvents(resourceIdsEvents) {
  const Resource = mongoose.model('Resource');
  return Resource.find({}).sort('name').exec()
    .then(resources => (
      // Decorate with the overlapping events used by the resources.
      resources.map((resource) => {
        // Annotated with events already using them
        const object = resource.toObject();
        object.events = resourceIdsEvents[object._id.toString()];
        return object;
      })
    ));
}

// Supporting functions for /events/unavailable-dates

function timeInHours(time) {
  const start = moment(time.start);
  const end = moment(time.end);
  return {
    start: start.hour() + (start.minute() / 60.0),
    end: end.hour() + (end.minute() / 60.0),
  };
}

function eventInHours(event) {
  let hours = [timeInHours(event)];
  if (event.times) {
    hours = hours.concat(event.times.map(timeInHours));
  }
  return hours;
}

function hoursOverlap(event2, hours) {
  const hours2 = eventInHours(event2);
  return hours.some(hour => (
    hours2.some(hour2 => (hour2.end > hour.start && hour2.start < hour.end))
  ));
}

function resourcesOverlap(event2, resourceIds) {
  return resourceIds.some(resourceId => (
    event2.resourceIds.some(resourceId2 => resourceId.equals(resourceId2))
  ));
}

function eventDates(event) {
  const dates = [event.start];
  return dates.concat(event.dates || []);
}

const unsetReferences = (data) => {
  data = unsetCalendarIfNeeded(data);
  data = unsetDomainIfNeeded(data);
  if (!data.path) {
    delete data.path;
    if (!data.$unset) {
      data.$unset = {};
    }
    data.$unset.path = '';
  }
  if (!data.image) {
    delete data.image;
    if (!data.$unset) {
      data.$unset = {};
    }
    data.$unset.image = '';
  }
  // remove deprecated text property
  delete data.text;
  if (!data.$unset) {
    data.$unset = {};
  }
  data.$unset.text = '';
  // remove deprecated address property
  delete data.address;
  if (!data.$unset) {
    data.$unset = {};
  }
  data.$unset.address = '';
  return data;
};

const PAGE_MESSAGE_FIELDS =
  'path name verses author date image series seriesId';

export const populateEvent = (data, session) => {
  const Message = mongoose.model('Message');
  const FormTemplate = mongoose.model('FormTemplate');
  const date = moment().subtract(1, 'day');
  const page = data.toObject();

  const promises = [Promise.resolve(page)];

  // Library
  page.sections
    .filter(section => (section.type === 'library' && section.libraryId))
    .forEach((section) => {
      promises.push(
        Message.findOne({
          libraryId: section.libraryId,
          date: { $lt: date.toString() },
          // series: { $ne: true }
        })
          .sort('-date').select(PAGE_MESSAGE_FIELDS).exec()
          .then((message) => {
            if (message && message.seriesId) {
              // get series also
              return Message.findOne({ _id: message.seriesId })
                .select(PAGE_MESSAGE_FIELDS).exec()
                .then(series => ({ message, series }));
            }
            return message;
          }),
      );
    });

  // Don't load formTemplate when rendering on the server, we don't have
  // a session.
  if (session !== false) {
    // FormTemplate
    page.sections
      .filter(section => (section.type === 'form' && section.formTemplateId))
      .forEach((section) => {
        section.formTemplateId = section.formTemplateId._id; // un-populate
        promises.push(
          FormTemplate.findOne({ _id: section.formTemplateId })
            .exec()
            .then((formTemplate) => {
              if (formTemplate) {
                formTemplate = addNewForm(formTemplate, session);
                if (session) {
                  return addForms(formTemplate, session);
                }
              }
              return formTemplate;
            }),
        );
      });
  }

  return Promise.all(promises)
    .then((docs) => {
      let docsIndex = 0;
      // const pageData = docs[docsIndex].toObject();
      page.sections.filter(section => section.type === 'library')
        .forEach((section) => {
          docsIndex += 1;
          section.message = docs[docsIndex];
        });
      page.sections.filter(section => section.type === 'calendar')
        .forEach((section) => {
          docsIndex += 1;
          section.events = docs[docsIndex];
        });
      page.sections.filter(section => section.type === 'form')
        .forEach((section) => {
          docsIndex += 1;
          section.formTemplate = docs[docsIndex];
        });
      return page;
    });
};

export const eventPopulations = [
  { path: 'primaryEventId', select: 'name path' },
  { path: 'calendarId', select: 'name path' },
  { path: 'sections.formTemplateId',
    select: 'name',
    model: 'FormTemplate' },
  { path: 'sections.libraryId',
    select: 'name',
    model: 'Library' },
  { path: 'sections.people.id', select: 'name image', model: 'User' },
];

export default function (router) {
  router.post('/events/resources', (req, res) => {
    getSession(req)
      .then(requireSomeAdministrator)
      // Get all events that overlap this event.
      .then(() => {
        const Event = mongoose.model('Event');
        const event = new Event(req.body);
        return overlappingEvents(event);
      })
      // Collect the resourceIds they use.
      .then(resourceIdsWithEvents)
      // Get all resources and annotate with events.
      .then(resourcesWithEvents)
      .then(resources => res.status(200).json(resources))
      .catch(error => catcher(error, res));
  });

  router.post('/events/unavailable-dates', (req, res) => {
    getSession(req)
      .then(requireSomeAdministrator)
      .then(() => {
        const Event = mongoose.model('Event');
        const event = new Event(req.body);

        const hours = eventInHours(event);
        const resourceIds = event.resourceIds;

        // Find all events using the resources this event is using at the same
        // times of day.
        return Event.find({ _id: { $ne: event._id } }).exec()
          .then(events => (
            // events using a same resource
            events.filter(event2 => resourcesOverlap(event2, resourceIds))
              // events at the same time of day
              .filter(event2 => hoursOverlap(event2, hours))
              .map(eventDates)
          ));
      })
      .then((unavailableDates) => {
        let unavailableDatesMerged = [];
        unavailableDates.forEach((dates) => {
          unavailableDatesMerged = unavailableDatesMerged.concat(dates);
        });
        return unavailableDatesMerged;
      })
      .then(unavailableDates => res.status(200).json(unavailableDates))
      .catch(error => catcher(error, res));
  });

  router.get('/events/:id/:imageName', (req, res) => {
    const Event = mongoose.model('Event');
    const id = req.params.id;
    const imageName = req.params.imageName;
    Event.findOne({ _id: id }).exec()
      .then((event) => {
        if (event.image && event.image.name === imageName) {
          sendImage(event.image, res);
        } else {
          res.status(404).send();
        }
      })
      .catch(error => catcher(error, res));
  });

  register(router, {
    category: 'events',
    modelName: 'Event',
    index: {
      authorization: requireSomeAdministrator,
      filterAuthorized: authorizedForDomain,
    },
    get: {
      authorization: allowAnyone,
      populate: eventPopulations,
      transformOut: (event, req, session) => {
        if (event && req.query.populate) {
          return populateEvent(event, session);
        }
        return event;
      },
    },
    post: {
      authorization: requireSomeAdministrator,
    },
    put: {
      authorization: requireSomeAdministrator,
      transformIn: unsetReferences,
    },
    delete: {
      authorization: requireSomeAdministrator,
    },
  });
}
