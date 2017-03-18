import mongoose from 'mongoose';
import moment from 'moment';
import register from './register';
import { authorize, authorizedForDomain } from './auth';
import { unsetDomainIfNeeded } from './domains';

mongoose.Promise = global.Promise;

const ID_REGEXP = /^[0-9a-fA-F]{24}$/;

export function splitEvents(events, start, end) {
  // separate by dates within the range
  const result = [];
  events.forEach((event) => {
    const base = { _id: event._id, name: event.name, path: event.path };

    if (moment(event.start).isBetween(start, end) ||
      moment(event.end).isBetween(start, end)) {
      result.push({
        ...base, id: event._id, start: event.start, end: event.end,
      });
      event.times.forEach((time) => {
        result.push({
          ...base, id: `${event._id}-1`, start: time.start, end: time.end,
        });
      });
    }

    if (event.dates && event.dates.length > 0) {
      const times = [[
        moment(event.start).format('HH:mm:ss'),
        moment(event.end).format('HH:mm:ss'),
      ]];
      if (event.times) {
        event.times.forEach((time) => {
          times.push([
            moment(time.start).format('HH:mm:ss'),
            moment(time.end).format('HH:mm:ss'),
          ]);
        });
      }

      event.dates.map(d => moment(d)).forEach((date, index) => {
        if (date.isBetween(start, end)) {
          times.forEach((time, index2) => {
            const start2 = moment(`${date.format('YYYY-MM-DD')}T${time[0]}`);
            const end2 = moment(`${date.format('YYYY-MM-DD')}T${time[1]}`);
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
      authorize: authorizedForDomain,
    },
    put: {
      transformIn: prepareCalendar,
      transformOut: (calendar) => {
        // update all Events in this calendar to have the same domain
        const Event = mongoose.model('Event');
        return Event.update({ calendarId: calendar._id },
          { $set: { domainId: calendar.domainId } }, { multi: true }).exec()
          .then(() => calendar);
      },
    },
  });

  router.get('/calendar', (req, res) => {
    authorize(req, res, false) // don't require session yet
    // get calendar, if any
    .then((session) => {
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
        .then(calendars => ({ session, calendars }));
      } else {
        promise = Promise.resolve({ session, calendars: [] });
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
        !(session.userId.administrator || session.userId.administratorDomainId)) {
        query.find({ public: true });
      } else if (!session.userId.administrator) {
        query.find({ $or: [
          { public: true }, { domainId: session.userId.administratorDomainId },
        ] });
      }
      query.select('path name start end dates times');

      return query.sort('start').exec()
      .then(events => ({
        calendars, events, session, dates: { date, start, end, previous, next },
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
      const { calendars, dates, events } = context;

      const weeks = [];
      const date = moment(dates.start).startOf('day');
      const end = moment(dates.end);
      let startOfWeek = moment(date);
      let days = [];

      while (date.isSameOrBefore(end)) {
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
        weeks.push({ startOfWeek, days });
      }

      return { calendars, dates, weeks };
    })
    // build response
    .then((context) => {
      const { calendars, dates, weeks } = context;
      const calendar = calendars.length === 1 ? calendars[0].toObject() : {};
      res.status(200).json({ ...calendar, ...dates, weeks });
    })
    .catch(error => res.status(400).json(error));
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
