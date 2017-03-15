import mongoose from 'mongoose';
import moment from 'moment';
import { authorize, authorizedForDomain } from './auth';
import { unsetDomainIfNeeded } from './domains';
import { unsetCalendarIfNeeded } from './calendars';
import register from './register';

mongoose.Promise = global.Promise;

// /api/events

// Supporting functions for /events/resources

function eventMoments(event) {
  let result = [{
    start: moment(event.start),
    end: moment(event.end),
  }];
  if (event.times) {
    result.concat(event.times.map(time => ({
      start: moment(time.start),
      end: moment(time.end),
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
          }),
          end: moment(date).set({
            hour: time.end.hour(),
            minute: time.end.minute(),
          }),
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
  // remove deprecated text property
  if (!data.$unset) {
    data.$unset = {};
  }
  data.$unset.text = '';
  // remove deprecated address property
  if (!data.$unset) {
    data.$unset = {};
  }
  data.$unset.address = '';
  return data;
};

export default function (router) {
  router.post('/events/resources', (req, res) => {
    authorize(req, res)
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
    .catch(error => res.status(400).json(error));
  });

  router.post('/events/unavailable-dates', (req, res) => {
    authorize(req, res)
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
    .catch(error => res.status(400).json(error));
  });

  register(router, {
    category: 'events',
    modelName: 'Event',
    index: {
      authorize: authorizedForDomain,
    },
    get: {
      populate: [
        { path: 'primaryEventId', select: 'name path' },
        { path: 'calendarId', select: 'name path' },
        { path: 'sections.formTemplateId',
          select: 'name',
          model: 'FormTemplate' },
        { path: 'sections.libraryId',
          select: 'name',
          model: 'Library' },
      ],
      transformOut: (doc) => {
        // convert deprecated text property to a section
        doc = doc.toObject();
        if (doc.text !== undefined) {
          if (doc.text && doc.sections.length === 0) {
            doc.sections.push({ type: 'text', text: doc.text });
          }
          delete doc.text;
        }
        // convert deprecated address property to a map
        if (doc.address !== undefined) {
          if (doc.address && doc.sections.length === 0) {
            doc.sections.push({ type: 'map', address: doc.address });
          }
          delete doc.address;
        }
        return doc;
      },
    },
    put: {
      transformIn: unsetReferences,
    },
  });
}
