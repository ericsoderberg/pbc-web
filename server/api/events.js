"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import moment from 'moment';
import { authorize } from './auth';
import { unsetDomainIfNeeded } from './domains';
import { unsetCalendarIfNeeded } from './calendars';
import register from './register';

// /api/events

// Supporting functions for /events/resources

function eventMoments (event) {
  let result = [{
    start: moment(event.start),
    end: moment(event.end)
  }];
  if (event.times) {
    result.concat(event.times.map(time => ({
      start: moment(time.start),
      end: moment(time.end)
    })));
  }
  if (event.dates) {
    let recurrence = [];
    event.dates.forEach(date => {
      result.forEach(time => {
        recurrence.push({
          start: moment(date).set({
            hour: time.start.hour(),
            minute: time.start.minute()
          }),
          end: moment(date).set({
            hour: time.end.hour(),
            minute: time.end.minute()
          })
        });
      });
    });
    result = result.concat(recurrence);
  }
  return result;
}

function overlapsMoments (event, moments) {
  const moments2 = eventMoments(event);
  return moments.some(moment => {
    return moments2.some(moment2 => {
      return (moment.end.isAfter(moment2.start) &&
        moment.start.isBefore(moment2.end));
    });
  });
}

function overlappingEvents (event) {
  const Event = mongoose.model('Event');
  const moments = eventMoments(event);
  return Event.find({ _id: { $ne: event._id } }).exec()
  .then(events => events.filter(event2 => overlapsMoments(event2, moments)));
}

function resourceIdsWithEvents (events) {
  let resourceIdsEvents = {}; // _id => [{ _id: <event id>, name: <event name }]
  events.forEach(event2 => {
    if (event2.resourceIds) {
      event2.resourceIds.forEach(resourceId => {
        const stringId = resourceId.toString();
        if (! resourceIdsEvents[stringId]) {
          resourceIdsEvents[stringId] = [];
        }
        resourceIdsEvents[stringId].push(
          { _id: event2._id, name: event2.name }
        );
      });
    }
  });
  return resourceIdsEvents;
}

function resourcesWithEvents (resourceIdsEvents) {
  const Resource = mongoose.model('Resource');
  return Resource.find({}).sort('name').exec()
  .then(resources => {
    // Decorate with the overlapping events used by the resources.
    return resources.map(resource => {
      // Annotated with events already using them
      let object = resource.toObject();
      object.events = resourceIdsEvents[object._id.toString()];
      return object;
    });
  });
}

// Supporting functions for /events/unavailable-dates

function timeInHours (time) {
  const start = moment(time.start);
  const end = moment(time.end);
  return {
    start: start.hour() + (start.minute() / 60.0),
    end: end.hour() + (end.minute() / 60.0)
  };
}

function eventInHours (event) {
  let hours = [timeInHours(event)];
  if (event.times) {
    hours = hours.concat(event.times.map(timeInHours));
  }
  return hours;
}

function hoursOverlap (event2, hours) {
  const hours2 = eventInHours(event2);
  return hours.some(hour => (
    hours2.some(hour2 => (hour2.end > hour.start && hour2.start < hour.end))
  ));
}

function resourcesOverlap (event2, resourceIds) {
  return resourceIds.some(resourceId => (
    event2.resourceIds.some(resourceId2 => resourceId.equals(resourceId2))
  ));
}

function eventDates (event) {
  let dates = [event.start];
  return dates.concat(event.dates || []);
}

const unsetReferences = (data) => {
  data = unsetCalendarIfNeeded(data);
  data = unsetDomainIfNeeded(data);
  return data;
};

export default function (router) {

  router.post('/events/resources', (req, res) => {
    authorize(req, res)
    // Get all events that overlap this event.
    .then(session => {
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
    .then(session => {
      const Event = mongoose.model('Event');
      const event = new Event(req.body);

      const hours = eventInHours(event);
      const resourceIds = event.resourceIds;

      // Find all events using the resources this event is using at the same
      // times of day.
      return Event.find({ _id: { $ne: event._id } }).exec()
      .then(events => {
        // events using a same resource
        return events.filter(event2 => resourcesOverlap(event2, resourceIds))
        // events at the same time of day
        .filter(event2 => hoursOverlap(event2, hours))
        .map(eventDates);
      });
    })
    .then(unavailableDatess => {
      let unavailableDates = [];
      unavailableDatess.forEach(dates => {
        unavailableDates = unavailableDates.concat(dates);
      });
      return unavailableDates;
    })
    .then(unavailableDates => res.status(200).json(unavailableDates))
    .catch(error => res.status(400).json(error));
  });

  register(router, {
    category: 'events',
    modelName: 'Event',
    get: {
      populate: [
        { path: 'primaryEventId', select: 'name path' },
        { path: 'calendarId', select: 'name path' },
        { path: 'formTemplateId', select: 'name' }
      ]
    },
    put: {
      transformIn: unsetReferences
    }
  });
}
