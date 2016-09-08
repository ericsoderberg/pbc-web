"use strict";
import mongoose from 'mongoose';
import moment from 'moment';

// /api/calendar

export default function (router) {
  router.get('/calendar', (req, res) => {
    const date = moment(req.query.date || undefined);
    const start = moment(date).startOf('month').startOf('week');
    const end = moment(date).endOf('month').endOf('week');
    const previous = moment(date).subtract(1, 'month');
    const next = moment(date).add(1, 'month');
    // find all events withing the time window
    const Event = mongoose.model('Event');
    let q = {
      end: { $gte: start.toDate() },
      start: { $lt: end.toDate() }
    };
    if (req.query.search) {
      const exp = new RegExp(req.query.search, 'i');
      q.name = exp;
    }
    if (req.query.filter) {
      q = { ...q, ...JSON.parse(req.query.filter) };
    }
    Event.find(q)
    .sort('start')
    .exec()
    .then(docs => {
      res.status(200).json({
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
}
