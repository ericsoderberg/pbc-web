import mongoose from 'mongoose';
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
  const eventFields = 'name start end location times image dates';
  const Message = mongoose.model('Message');
  const messageFields = 'name verses date path author';
  const Page = mongoose.model('Page');
  const pageFields = 'name path';

  return Promise.all(newsletter.sections.map((section) => {
    switch (section.type) {
      case 'text': return section;

      case 'image': return section;

      case 'event': return Event.findOne({ _id: section.eventId })
      .select(eventFields).exec()
      .then(event => ({ ...section.toObject(), eventId: event }));

      case 'library': return Promise.all([
        Message.find({
          libraryId: section.libraryId,
          date: { $gt: newsletter.date },
          series: { $ne: true },
        }).sort('date').limit(1).select(messageFields)
        .exec(),
        Message.find({
          libraryId: section.libraryId,
          date: { $lt: newsletter.date },
          series: { $ne: true },
        }).sort('-date').limit(1).select(messageFields)
        .exec(),
      ])
      .then(docs => ({
        ...section.toObject(),
        nextMessage: docs[0][0],
        previousMessage: docs[1][0],
      }));

      case 'pages': return Promise.all(section.pages.map(pageRef =>
        Page.findOne({ _id: pageRef.id }).select(pageFields).exec()))
      .then(pages => ({
        ...section.toObject(),
        pages: section.pages.map((page, index) => ({
          ...page.toObject(),
          page: pages[index],
        })),
      }));

      case 'files': return section;

      default: return section;
    }
  }))
  .then(sections => ({ ...newsletter.toObject(), sections }));
};

export default function (router, transporter) {
  router.post('/newsletters/render', (req, res) => {
    const Newsletter = mongoose.model('Newsletter');
    authorize(req, res)
    .then(() => {
      const newsletter = new Newsletter(req.body);
      return populateNewsletterForRendering(newsletter);
    })
    .then(newsletter => renderNewsletter(newsletter, `${req.headers.origin}`, ''))
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
      const markup = renderNewsletter(newsletter, `${req.headers.origin}`, address);
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
