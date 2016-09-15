"use strict";
import mongoose from 'mongoose';
import moment from 'moment';
import { authorizedForDomain, unsetDomainIfNeeded } from './auth';
import register from './register';

import { render as renderNewsletter } from './newsletter';

// /api/newsletters

export default function (router, transporter) {

  router.post('/newsletters/render', (req, res) => {
    const Newsletter = mongoose.model('Newsletter');
    const newsletter = new Newsletter(req.body);
    const Message = mongoose.model('Message');
    const Event = mongoose.model('Event');
    const messageFields = 'name verses date path author';

    // nextMessage
    let nextPromise;
    if (newsletter.date && newsletter.library) {
      nextPromise = Message.find({
        library: newsletter.library,
        date: { $gt: newsletter.date },
        series: { $ne: true }
      })
      .sort('date').limit(1).select(messageFields).exec();
    } else {
      nextPromise = Promise.resolve([]);
    }

    // previousMessage
    let previousPromise;
    if (newsletter.date && newsletter.library) {
      previousPromise = Message.find({
        library: newsletter.library,
        date: { $lt: newsletter.date },
        series: { $ne: true }
      })
      .sort('-date').limit(1).select(messageFields).exec();
    } else {
      previousPromise = Promise.resolve([]);
    }

    // events
    let eventsPromise;
    if (newsletter.date && newsletter.calendar) {
      const date = moment(newsletter.date);
      eventsPromise = Event.find({
        calendar: newsletter.calendar,
        start: {
          $gt: date.toDate(),
          $lt: moment(date).add(2, 'months').toDate()
        }
      }).exec();
    } else {
      eventsPromise = Promise.resolve([]);
    }

    Promise.all([Promise.resolve(newsletter), nextPromise,
      previousPromise, eventsPromise])
    .then(docs => {
      let newsletterData = docs[0].toObject();
      newsletterData.nextMessage = docs[1][0];
      newsletterData.previousMessage = docs[2][0];
      newsletterData.events = docs[3];
      res.send(renderNewsletter(newsletterData));
    })
    .catch(error => res.status(400).json(error));
  });

  register(router, 'newsletters', 'Newsletter', {
    authorize: {
      index: authorizedForDomain
    },
    transformIn: {
      put: unsetDomainIfNeeded
    }
  });
}
