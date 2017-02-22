"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import fs from 'fs';
import { authorize } from './auth';

export var ICON_DIR = `${__dirname}/../../`;

if (process.env.PAYPAL_CLIENT_ID) {
  console.log('PayPal available');
} else {
  console.log('PayPal unavailable, set PAYPAL_CLIENT_ID environment variable');
}

// /api/site

export default function (router) {

  router.get('/site', (req, res) => {
    const Doc = mongoose.model('Site');
    Doc.findOne({})
    .populate({ path: 'homePageId', select: 'name' })
    .exec()
    .then(site => {
      site = site.toObject();
      site.paypalClientId = process.env.PAYPAL_CLIENT_ID;
      return site;
    })
    .then(site => res.json(site))
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
    .then(site => {
      // copy shortcut and mobile icons
      if (site.shortcutIcon) {
        // strip metadata
        const matches = site.shortcutIcon.data.match(/^(data:.+;base64,)(.*)$/);
        // const metadata = matches[1];
        const base64Data = matches[2];
        fs.writeFile(`${ICON_DIR}/shortcut-icon.png`, base64Data, 'base64',
          function(err) {
            console.log(err);
          });
      }
      if (site.mobileIcon) {
        // strip metadata
        const matches = site.mobileIcon.data.match(/^(data:.+;base64,)(.*)$/);
        // const metadata = matches[1];
        const base64Data = matches[2];
        fs.writeFile(`${ICON_DIR}/mobile-app-icon.png`, base64Data, 'base64',
          function(err) {
            console.log(err);
          });
      }
      return site;
    })
    .then(site => res.status(200).json(site))
    .catch(error => res.status(400).json(error));
  });
}
