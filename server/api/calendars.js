"use strict";
import mongoose from 'mongoose';
import moment from 'moment';
import register from './register';
import { authorizedAdministrator } from './auth';

const ID_REGEXP = /^[0-9a-fA-F]{24}$/;

// /api/calendars and /api/calendar

export default function (router) {

  register(router, {
    category: 'calendars',
    modelName: 'Calendar',
    index: {
      authorize: authorizedAdministrator
    },
    put: {
      transformOut: (calendar) => {
        // update all Events in this calendar to have the same domain
        const Event = mongoose.model('Event');
        return Event.update({ calendarId: calendar._id },
          { $set: { domainId: calendar.domainId } }, { multi: true }).exec()
          .then(() => calendar);
      }
    }
  });

  router.get('/calendar', (req, res) => {
    const Calendar = mongoose.model('Calendar');
    const Event = mongoose.model('Event');
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
      promise = Calendar.find(criteria).exec();
    } else {
      promise = Promise.resolve([]);
    }

    promise.then(calendars => {
      const date = moment(req.query.date || undefined);
      const start = moment(date).startOf('month').startOf('week');
      const end = moment(date).endOf('month').endOf('week');
      const previous = moment(date).subtract(1, 'month');
      const next = moment(date).add(1, 'month');

      // find all events withing the time window
      let q = {
        $or: [
          { end: { $gte: start.toDate() }, start: { $lt: end.toDate() } },
          { dates: { $gte: start.toDate(), $lt: end.toDate() }}
        ]
      };
      if (req.query.search) {
        const exp = new RegExp(req.query.search, 'i');
        q.name = exp;
      }
      if (calendars.length > 0) {
        q = { ...q,
          $or: calendars.map(calendar => ( { calendarId: calendar._id }))
        };
      }
      Event.find(q)
      .sort('start')
      .exec()
      .then(docs => {
        const calendar = calendars.length === 1 ? calendars[0].toObject() : {};
        res.status(200).json({
          ...calendar,
          date: date,
          end: end,
          events: docs,
          next: next,
          previous: previous,
          start: start
        });
      })
      .catch(error => res.status(400).json(error));
    });
  });
}

export function unsetCalendarIfNeeded (data) {
  if (! data.calendarId) {
    delete data.calendarId;
    if (! data.$unset) {
      data.$unset = {};
    }
    data.$unset.calendarId = '';
  }
  return data;
}
