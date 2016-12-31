"use strict";
import mongoose from 'mongoose';
import fs from 'fs';
import { authorize } from './auth';

export var ICON_DIR = `${__dirname}/../../`;

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
    .then(doc => {
      // copy shortcut and mobile icons
      if (doc.shortcutIcon) {
        // strip metadata
        const matches = doc.shortcutIcon.data.match(/^(data:.+;base64,)(.*)$/);
        // const metadata = matches[1];
        const base64Data = matches[2];
        fs.writeFile(`${ICON_DIR}/shortcut-icon.png`, base64Data, 'base64',
          function(err) {
            console.log(err);
          });
      }
      if (doc.mobileIcon) {
        // strip metadata
        const matches = doc.mobileIcon.data.match(/^(data:.+;base64,)(.*)$/);
        // const metadata = matches[1];
        const base64Data = matches[2];
        fs.writeFile(`${ICON_DIR}/mobile-app-icon.png`, base64Data, 'base64',
          function(err) {
            console.log(err);
          });
      }
    })
    .then(doc => res.status(200).json(doc))
    .catch(error => res.status(400).json(error));
  });
}
