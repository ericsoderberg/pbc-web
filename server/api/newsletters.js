import mongoose from 'mongoose';
// import moment from 'moment';
import { authorize, authorizedForDomain } from './auth';
import { unsetDomainIfNeeded } from './domains';
import { unsetLibraryIfNeeded } from './libraries';
import register from './register';
import { render as renderNewsletter } from './newsletter';

mongoose.Promise = global.Promise;

// /api/newsletters

const unsetReferences = (data) => {
  data = unsetLibraryIfNeeded(data);
  data = unsetDomainIfNeeded(data);
  return data;
};

const populateNewsletterForRendering = (newsletter) => {
  const Event = mongoose.model('Event');
  // const Message = mongoose.model('Message');
  // const messageFields = 'name verses date path author';

  return Promise.all(newsletter.sections.map((section) => {
    switch (section.type) {
      case 'text': return section;
      case 'image': return section;
      case 'event': return Event.findOne({ _id: section.eventId },
        'name start end location times image dates')
      .then(event => ({ ...section.toObject(), eventId: event }));
      default: return section;
    }
  }))
  .then((sections) => {
    newsletter.sections = sections;
    return newsletter;
  });

  // // nextMessage
  // let nextPromise;
  // if (newsletter.date && newsletter.libraryId) {
  //   nextPromise = Message.find({
  //     libraryId: newsletter.libraryId,
  //     date: { $gt: newsletter.date },
  //     series: { $ne: true },
  //   })
  //   .sort('date').limit(1).select(messageFields)
  //   .exec();
  // } else {
  //   nextPromise = Promise.resolve([]);
  // }
  //
  // // previousMessage
  // let previousPromise;
  // if (newsletter.date && newsletter.libraryId) {
  //   previousPromise = Message.find({
  //     libraryId: newsletter.libraryId,
  //     date: { $lt: newsletter.date },
  //     series: { $ne: true },
  //   })
  //   .sort('-date').limit(1).select(messageFields)
  //   .exec();
  // } else {
  //   previousPromise = Promise.resolve([]);
  // }
  //
  // // events
  // const eventPromises = [];
  // (newsletter.eventIds || []).forEach((eventId) => {
  //   const promise = Event.findOne({ _id: eventId }).exec();
  //   eventPromises.push(promise);
  // });

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

  // return Promise.all([Promise.resolve(newsletter), nextPromise,
  //   previousPromise, Promise.all(eventPromises)])
  // .then((docs) => {
  //   const newsletterData = docs[0].toObject();
  //   newsletterData.nextMessage = docs[1][0];
  //   newsletterData.previousMessage = docs[2][0];
  //   newsletterData.events = docs[3];
  //   return newsletterData;
  // });
};

export default function (router, transporter) {
  router.post('/newsletters/render', (req, res) => {
    const Newsletter = mongoose.model('Newsletter');
    authorize(req, res)
    .then(() => {
      const newsletter = new Newsletter(req.body);
      return populateNewsletterForRendering(newsletter);
    })
    .then(newsletter => renderNewsletter(newsletter, `${req.headers.origin}`))
    .then(markup => res.send(markup))
    .catch((error) => {
      console.error('!!! error', error);
      res.status(400).json(error);
    });
  });

  router.post('/newsletters/:id/send', (req, res) => {
    const Newsletter = mongoose.model('Newsletter');
    const Site = mongoose.model('Site');
    const id = req.params.id;
    const address = req.body.address;
    authorize(req, res)
    .then(() => Newsletter.findOne({ _id: id }).exec())
    .then(newsletter => populateNewsletterForRendering(newsletter))
    .then((newsletter) => {
      const markup = renderNewsletter(newsletter, `${req.headers.origin}`);
      return { newsletter, markup };
    })
    .then(context => Site.findOne({}).exec()
      .then(site => ({ ...context, site })))
    .then((context) => {
      const { newsletter, markup, site } = context;
      return new Promise((resolve, reject) => {
        transporter.sendMail({
          from: site.email,
          to: address,
          subject: newsletter.name,
          html: markup,
        }, (err, info) => {
          if (err) { reject(err); } else { resolve(info); }
        });
      });
    })
    .then(() => res.status(200).json({}))
    .catch((error) => {
      console.error('!!! error', error);
      res.status(400).json(error);
    });
  });

  register(router, {
    category: 'newsletters',
    modelName: 'Newsletter',
    index: {
      authorize: authorizedForDomain,
    },
    get: {
      populate: [
        { path: 'eventIds', select: 'name path' },
      ],
    },
    put: {
      transformIn: unsetReferences,
    },
  });
}
