import mongoose from 'mongoose';
import moment from 'moment-timezone';
import { getSession } from './auth';
import { catcher } from './utils';

mongoose.Promise = global.Promise;

// /api/search

export default function (router) {
  router.get('/search', (req, res) => {
    getSession(req)
    .then((session) => {
      // start with pages
      const Page = mongoose.model('Page');
      return Page.find(
        {
          $text: { $search: req.query.search },
          public: true,
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
      const Event = mongoose.model('Event');
      const recently = moment().subtract(1, 'week');
      const dateCriteria = [
        { end: { $gte: recently.toDate() } },
        { dates: { $gte: recently.toDate() } },
      ];
      return Event.find(
        {
          $text: { $search: req.query.search },
          public: true,
          $or: dateCriteria,
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
    .then((context) => {
      const { pages, events, libraries } = context;
      res.status(200).json({ pages, events, libraries });
    })
    .catch(error => catcher(error, res));
  });
}
