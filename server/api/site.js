"use strict";
import mongoose from 'mongoose';
import { authorize } from './auth';

// /api/site

export default function (router) {

  router.get('/site', (req, res) => {
    const Doc = mongoose.model('Site');
    Doc.findOne({})
    .populate({ path: 'homePageId', select: 'name' })
    .exec()
    .then(doc => res.json(doc))
    .catch(error => res.status(400).json(error));
  });

  router.post('/site', (req, res) => {
    authorize(req, res)
    .then(session => {
      const Doc = mongoose.model('Site');
      let data = req.body;
      data.modified = new Date();
      data.userId = session.userId;
      const doc = new Doc(data);
      return Doc.remove({}).exec()
      .then(() => doc.save());
    })
    .then(doc => res.status(200).json(doc))
    .catch(error => res.status(400).json(error));
  });
}
