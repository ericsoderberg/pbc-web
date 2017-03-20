import mongoose from 'mongoose';
import { authorize, authorizedForDomain } from './auth';

mongoose.Promise = global.Promise;

// /api/search

export default function (router) {
  router.get('/search', (req, res) => {
    authorize(req, res, false)
    .then((session) => {
      // start with pages
      const Page = mongoose.model('Page');
      return Page.find(
        {
          $text: { $search: req.query.search },
          $or: [authorizedForDomain(session), { public: true }],
        },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' }, modified: -1 })
      .limit(10)
      .exec()
      .then(pages => ({ session, pages }));
    })
    .then((context) => {
      let { pages } = context;

      // prune sections down to just text
      const exp = new RegExp(req.query.search, 'i');
      pages = pages.map((doc) => {
        doc.sections = doc.sections
        .filter(section => section.type === 'text' && section.text)
        .map((section) => {
          // prune text down to just snippet with first match
          const index = section.text.search(exp);
          const fromIndex =
            Math.max(0, section.text.lastIndexOf(' ', Math.max(0, index - 80)));
          const toIndex = section.text.indexOf(' ', index + 80);

          section.text = section.text
          .slice(fromIndex, toIndex)
          .replace(exp, `**${req.query.search}**`);

          return section;
        });

        // Add at least one blank text section
        if (doc.sections.length === 0) {
          doc.sections.push({ type: 'text', text: '' });
        }

        return doc;
      });

      return { ...context, pages };
    })
    // check events too
    .then((context) => {
      const { session } = context;
      const Event = mongoose.model('Event');
      return Event.find(
        {
          $text: { $search: req.query.search },
          $or: [authorizedForDomain(session), { public: true }],
        },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' }, modified: -1 })
      .limit(10)
      .exec()
      .then(events => ({ ...context, events }));
    })
    // check libraries
    .then((context) => {
      const Library = mongoose.model('Library');
      return Library.find(
        {
          $text: { $search: req.query.search },
        },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' }, modified: -1 })
      .limit(10)
      .exec()
      .then(libraries => ({ ...context, libraries }));
    })
    // // check messages
    // .then(context => {
    //   const Message = mongoose.model('Message');
    //   return Message.find(
    //     {
    //       $text: { $search: req.query.search }
    //     },
    //     { score : { $meta: "textScore" } }
    //   )
    //   .sort({ score: { $meta: "textScore" }, modified: -1 })
    //   .limit(10)
    //   .exec()
    //   .then(messages => ({ ...context, messages }));
    // })
    .then((context) => {
      const { pages, events, libraries } = context;
      res.status(200).json({ pages, events, libraries });
    })
    .catch((error) => {
      console.error('!!!', error);
      res.status(400).json(error);
    });
  });
}
