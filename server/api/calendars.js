"use strict";
import mongoose from 'mongoose';
import moment from 'moment';
import register from './register';
import { authorizedAdministrator } from './auth';

const ID_REGEXP = /^[0-9a-fA-F]{24}$/;

// /api/calendars and /api/calendar

export default function (router) {

  register(router, 'calendars', 'Calendar', {
    authorize: {
      index: authorizedAdministrator
    }
  });

  router.get('/calendar', (req, res) => {
    const Calendar = mongoose.model('Calendar');
    const Event = mongoose.model('Event');
    const id = req.query.id;

    // if we have an id, get the calendar by _id or path
    let promise;
    if (id) {
      const criteria = ID_REGEXP.test(id) ? {_id: id} : {path: id};
      promise = Calendar.findOne(criteria).exec();
    } else {
      promise = Promise.resolve(undefined);
    }

    promise.then(calendar => {
      const date = moment(req.query.date || undefined);
      const start = moment(date).startOf('month').startOf('week');
      const end = moment(date).endOf('month').endOf('week');
      const previous = moment(date).subtract(1, 'month');
      const next = moment(date).add(1, 'month');

      // find all events withing the time window
      let q = {
        end: { $gte: start.toDate() },
        start: { $lt: end.toDate() }
      };
      if (req.query.search) {
        const exp = new RegExp(req.query.search, 'i');
        q.name = exp;
      }
      if (calendar) {
        q = { ...q, calendarId: calendar._id };
      }
      Event.find(q)
      .sort('start')
      .exec()
      .then(docs => {
        calendar = (calendar ? calendar.toObject() : {});
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
