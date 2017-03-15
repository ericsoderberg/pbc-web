import mongoose from 'mongoose';
import moment from 'moment';
import register from './register';
import { authorize, authorizedAdministrator } from './auth';
import { unsetDomainIfNeeded } from './domains';

mongoose.Promise = global.Promise;

const ID_REGEXP = /^[0-9a-fA-F]{24}$/;

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
      authorize: authorizedAdministrator,
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
    .then((context) => {
      const { calendars, session } = context;
      const Event = mongoose.model('Event');
      const date = moment(req.query.date || undefined);
      const start = moment(date).startOf('month').startOf('week');
      const end = moment(date).endOf('month').endOf('week');
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

      return query.sort('start').exec()
      .then(events => ({
        calendars, events, session, dates: { date, start, end, previous, next },
      }));
    })
    .then((context) => {
      const { calendars, dates, events } = context;
      const calendar = calendars.length === 1 ? calendars[0].toObject() : {};
      res.status(200).json({ ...calendar, ...dates, events });
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
