"use strict";
import mongoose from 'mongoose';

// /api/search

export default function (router) {
  router.get('/search', (req, res) => {
    // start with pages
    const Page = mongoose.model('Page');
    Page.find(
      { $text: { $search: req.query.search } },
      { score : { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" }, modified: -1 })
    .limit(10)
    .exec()
    .then(docs => {

      // prune sections down to just text
      const exp = new RegExp(req.query.search, 'i');
      return docs.map(doc => {

        doc.sections = doc.sections
        .filter(section => 'text' === section.type)
        .map(section => {

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
    })
    // check events too
    .then(pages => {
      const Event = mongoose.model('Event');
      return Event.find(
        { $text: { $search: req.query.search } },
        { score : { $meta: "textScore" } }
      )
      .sort({ score: { $meta: "textScore" }, modified: -1 })
      .limit(10)
      .exec()
      .then(events => ([ ...pages, ...events ]));
    })
    .then(result => res.status(200).json(result))
    .catch(error => {
      console.log('!!!', error);
      res.status(400).json(error);
    });
  });
}
