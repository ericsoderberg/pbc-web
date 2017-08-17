import mongoose from 'mongoose';
import moment from 'moment-timezone';
import register from './register';
import {
  getSession, allowAnyone, authorizedForDomain, requireAdministrator,
  requireSomeAdministrator,
} from './auth';
import { unsetDomainIfNeeded } from './domains';
import { catcher } from './utils';

mongoose.Promise = global.Promise;

const ID_REGEXP = /^[0-9a-fA-F]{24}$/;

export function splitEvents(events, start, end, includeResources = false) {
  // separate by dates within the range
  const result = [];
  events.forEach((event) => {
    const base = {
      _id: event._id, name: event.name, path: event.path, allDay: event.allDay,
    };
    if (includeResources) {
      base.resourceIds = event.resourceIds.slice(0);
    }

    const day = moment(event.start);
    const endDate = moment(event.end);
    while (day.isSameOrBefore(endDate, 'day')) {
      if (day.isBetween(start, end)) {
        const dayEvent = { ...base, id: event._id, start: moment(day) };
        const endOfDay = moment(day).endOf('day');
        if (moment(event.end).isBefore(endOfDay)) {
          dayEvent.end = event.end;
        } else {
          dayEvent.end = endOfDay;
        }
        if (day.isAfter(event.start, 'day')) {
          dayEvent.multi = true;
        }
        result.push(dayEvent);

        event.times.forEach((time) => {
          result.push({
            ...base, id: `${event._id}-1`, start: time.start, end: time.end,
          });
        });
      }
      day.add(1, 'day').startOf('day');
    }

    if (event.dates && event.dates.length > 0) {
      const times = [[moment(event.start), moment(event.end)]];
      if (event.times) {
        event.times.forEach((time) => {
          times.push([moment(time.start), moment(time.end)]);
        });
      }

      event.dates.map(d => moment(d))
        .filter(d => !d.isSame(event.start, 'day'))
        .forEach((date, index) => {
          if (date.isBetween(start, end)) {
            times.forEach((time, index2) => {
              const [timeStart, timeEnd] = time;
              const start2 =
                moment(date).hour(timeStart.hour()).minute(timeStart.minute());
              const end2 =
                moment(date).hour(timeEnd.hour()).minute(timeEnd.minute());
              result.push({
                ...base,
                id: `${event._id}-${index}-${index2}`,
                start: start2,
                end: end2,
              });
            });
          }
        });
    }
  });

  return result;
}

export function sortEvents(events) {
  return events.sort((e1, e2) => {
    if (moment(e1.start).isBefore(moment(e2.start))) {
      return -1;
    }
    return 1;
  });
}

export function eventsToCalendarWeeks(events, start, end) {
  const weeks = [];
  const date = moment(start).startOf('day');
  const endDate = moment(end).endOf('day');
  let startOfWeek = moment(date);
  let days = [];

  while (date.isSameOrBefore(endDate)) {
    if (startOfWeek.isBefore(date, 'week')) {
      weeks.push({ start: startOfWeek, days });
      startOfWeek = moment(date);
      days = [];
    }

    const eventsForDay = [];
    while (events.length > 0 &&
      moment(events[0].start).isSameOrBefore(date, 'day')) {
      eventsForDay.push(events.shift());
    }
    days.push({ date: date.toISOString(), events: eventsForDay });

    date.add(1, 'day');
  }
  if (startOfWeek.isBefore(date, 'week')) {
    weeks.push({ start: startOfWeek, days });
  }

  return weeks;
}

// /api/calendars and /api/calendar

const prepareCalendar = (data) => {
  data = unsetDomainIfNeeded(data);
  if (!data.path) {
    delete data.path;
    if (!data.$unset) {
      data.$unset = {};
    }
    data.$unset.path = '';
  }
  return data;
};

export default function (router) {
  register(router, {
    category: 'calendars',
    modelName: 'Calendar',
    index: {
      authorization: allowAnyone,
      filterAuthorized: authorizedForDomain,
    },
    get: {
      authorization: requireSomeAdministrator,
    },
    post: {
      authorization: requireSomeAdministrator,
    },
    put: {
      authorization: requireSomeAdministrator,
      transformIn: prepareCalendar,
      transformOut: (calendar) => {
        // update all Events in this calendar to have the same domain
        const Event = mongoose.model('Event');
        return Event.update({ calendarId: calendar._id },
          { $set: { domainId: calendar.domainId } }, { multi: true }).exec()
          .then(() => calendar);
      },
    },
    delete: {
      authorization: requireSomeAdministrator,
    },
  });

  router.get('/calendar', (req, res) => {
    getSession(req)
      .then(allowAnyone)
      // get site so we can set the timezone
      .then((session) => {
        const Site = mongoose.model('Site');
        return Site.findOne({}).exec()
          .then(site =>
            moment.tz.setDefault(site.timezone || 'America/Los_Angeles'))
          .then(() => ({ session }));
      })
      // get calendar, if any
      .then((context) => {
        const Calendar = mongoose.model('Calendar');
        const id = req.query.id;

        // if we have an id, get the calendar by _id or path
        let promise;
        if (id) {
          let criteria;
          if (Array.isArray(id)) {
            criteria = { $or: id.map(id2 => ({ _id: id2 })) };
          } else {
            criteria = ID_REGEXP.test(id) ? { _id: id } : { path: id };
          }
          promise = Calendar.find(criteria).exec()
            .then(calendars => ({ ...context, calendars }));
        } else {
          promise = Promise.resolve({ ...context, calendars: [] });
        }
        return promise;
      })
      // get events
      .then((context) => {
        const { calendars, session } = context;
        const Event = mongoose.model('Event');
        const date = moment(req.query.date || undefined);
        const start = moment(date).startOf('month').startOf('week');
        const end = moment(date).startOf('month')
          .add((req.query.months || 1), 'month').endOf('week');
        const previous = moment(date).subtract(1, 'month').startOf('month');
        const next = moment(date).add(1, 'month').startOf('month');

        const query = Event.find();

        // find events withing the time window
        const dateCriteria = [
          { end: { $gte: start.toDate() }, start: { $lt: end.toDate() } },
          { dates: { $gte: start.toDate(), $lt: end.toDate() } },
        ];
        query.find({ $or: dateCriteria });

        if (req.query.search) {
          const exp = new RegExp(req.query.search, 'i');
          query.find({ name: exp });
        }
        if (calendars.length > 0) {
          query.find({
            $or: calendars.map(calendar => ({ calendarId: calendar._id })),
          });
        }
        if (!session ||
          !(session.userId.administrator ||
            (session.userId.domainIds && session.userId.domainIds.length > 0))) {
          query.find({ public: true });
        } else if (!session.userId.administrator) {
          query.find({ $or: [
            { public: true }, { domainId: { $in: session.userId.domainIds } },
          ] });
        }
        query.select('path name start end dates times allDay');

        return query.sort('start').exec()
          .then(events => ({
            ...context, events, dates: { date, start, end, previous, next },
          }));
      })
      // split events out
      .then((context) => {
        const { dates } = context;
        const events = splitEvents(context.events, dates.start, dates.end);
        return { ...context, events };
      })
      // sort events
      .then((context) => {
        const events = sortEvents(context.events);
        return { ...context, events };
      })
      // structure by weeks and days
      .then((context) => {
        const { dates, events } = context;
        const weeks = eventsToCalendarWeeks(events, dates.start, dates.end);
        return { ...context, weeks };
      })
      // build response
      .then((context) => {
        const { calendars, dates, weeks } = context;
        const calendar = calendars.length === 1 ? calendars[0].toObject() : {};
        res.status(200).json({ ...calendar, ...dates, weeks });
      })
      .catch(error => catcher(error, res));
  });
}

export function unsetCalendarIfNeeded(data) {
  if (!data.calendarId) {
    delete data.calendarId;
    if (!data.$unset) {
      data.$unset = {};
    }
    data.$unset.calendarId = '';
  }
  return data;
}
