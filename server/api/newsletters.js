"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
// import moment from 'moment';
import { authorizedForDomain } from './auth';
import { unsetDomainIfNeeded } from './domains';
import { unsetLibraryIfNeeded } from './libraries';
import register from './register';

import { render as renderNewsletter } from './newsletter';

// /api/newsletters

const unsetReferences = (data) => {
  data = unsetLibraryIfNeeded(data);
  data = unsetDomainIfNeeded(data);
  return data;
};

const populateNewsletterForRendering = (newsletter) => {
  const Message = mongoose.model('Message');
  const Event = mongoose.model('Event');
  const messageFields = 'name verses date path author';

  // nextMessage
  let nextPromise;
  if (newsletter.date && newsletter.libraryId) {
    nextPromise = Message.find({
      libraryId: newsletter.libraryId,
      date: { $gt: newsletter.date },
      series: { $ne: true }
    })
    .sort('date').limit(1).select(messageFields).exec();
  } else {
    nextPromise = Promise.resolve([]);
  }

  // previousMessage
  let previousPromise;
  if (newsletter.date && newsletter.libraryId) {
    previousPromise = Message.find({
      libraryId: newsletter.libraryId,
      date: { $lt: newsletter.date },
      series: { $ne: true }
    })
    .sort('-date').limit(1).select(messageFields).exec();
  } else {
    previousPromise = Promise.resolve([]);
  }

  // events
  let eventPromises = [];
  (newsletter.eventIds || []).forEach(eventId => {
    const promise = Event.findOne({ _id: eventId }).exec();
    eventPromises.push(promise);
  });
  // if (newsletter.date && newsletter.calendarId) {
  //   const start = moment(newsletter.date);
  //   const end = moment(start).add(2, 'months');
  //   // find events withing the time window for this calendar
  //   eventsPromise = Event.find({
  //     calendarId: newsletter.calendarId,
  //     $or: [
  //       { end: { $gte: start.toDate() }, start: { $lt: end.toDate() } },
  //       { dates: { $gte: start.toDate(), $lt: end.toDate() }}
  //     ]
  //   }).exec();
  // } else {
  //   eventsPromise = Promise.resolve([]);
  // }

  return Promise.all([Promise.resolve(newsletter), nextPromise,
    previousPromise, Promise.all(eventPromises)])
  .then(docs => {
    let newsletterData = docs[0].toObject();
    newsletterData.nextMessage = docs[1][0];
    newsletterData.previousMessage = docs[2][0];
    newsletterData.events = docs[3];
    return newsletterData;
  });
};

const send = (data, req, transporter) => {
  if (data.address) {
    console.log('!!! send to', data.address);
    const urlBase = `${req.headers.origin}`;
    const Site = mongoose.model('Site');
    return populateNewsletterForRendering(data)
    .then(newsletterData => renderNewsletter(newsletterData, urlBase))
    .then(markup => {
      return Site.findOne({}).exec()
      .then(site => ({ markup, site }));
    })
    .then(context => {
      const { markup, site } = context;
      transporter.sendMail({
        from: site.email,
        to: data.address,
        subject: data.name,
        html: markup
      }, (err, info) => {
        console.log('!!! sendMail', err, info);
      });
    })
    .then(() => data);
  } else {
    return data;
  }
};

export default function (router, transporter) {

  router.post('/newsletters/render', (req, res) => {
    const Newsletter = mongoose.model('Newsletter');
    const newsletter = new Newsletter(req.body);
    const urlBase = `${req.headers.origin}`;
    populateNewsletterForRendering(newsletter)
    .then(newsletterData => renderNewsletter(newsletterData, urlBase))
    .then(markup => res.send(markup))
    .catch(error => {
      console.log('!!! error', error);
      res.status(400).json(error);
    });
  });

  register(router, {
    category: 'newsletters',
    modelName: 'Newsletter',
    index: {
      authorize: authorizedForDomain
    },
    get: {
      populate: [
        { path: 'eventIds', select: 'name path' }
      ]
    },
    put: {
      transformIn: unsetReferences,
      transformOut: (data, req) => send(data, req, transporter)
    }
  });
}
