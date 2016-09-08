"use strict";
import mongoose from 'mongoose';

// /api/search

export default function (router) {
  router.get('/search', (req, res) => {
    const Page = mongoose.model('Page');
    const exp = new RegExp(req.query.search, 'ig');
    const q = { $or: [ { name: exp }, { 'sections.text': exp } ] };
    Page.find(q)
    .select('name sections')
    .limit(20)
    .exec()
    .then(docs => {
      // prune sections down to just text
      docs.forEach(doc => {
        doc.sections = doc.sections.filter(section => {
          if ('text' === section.type && exp.test(section.text)) {
            section.text =
              section.text.replace(exp, `**${req.query.search}**`);
            return true;
          }
          return false;
        });
      });
      res.status(200).json(docs);
    })
    .catch(error => res.status(400).json(error));
  });
}
