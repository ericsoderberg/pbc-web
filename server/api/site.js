import mongoose from 'mongoose';
import fs from 'fs';
import { getSession, requireAdministrator } from './auth';
import { catcher } from './utils';

mongoose.Promise = global.Promise;

export const ICON_DIR = `${__dirname}/../../`;

if (process.env.PAYPAL_CLIENT_ID) {
  /* eslint-disable no-console */
  console.log('PayPal available');
  /* elsint-enable no-console */
} else {
  console.warn('PayPal unavailable, set PAYPAL_CLIENT_ID environment variable');
}

// /api/site

export default function (router) {
  router.get('/site', (req, res) => {
    const Doc = mongoose.model('Site');
    Doc.findOne({})
      .populate({ path: 'homePageId', select: 'name' })
      .exec()
      .then((site) => {
        site = site.toObject();
        site.paypalClientId = process.env.PAYPAL_CLIENT_ID;
        site.paypalEnv = process.env.NODE_ENV === 'development' ? 'sandbox' : 'production';
        return site;
      })
      .then(site => res.json(site))
      .catch(error => catcher(error, res));
  });

  router.post('/site', (req, res) => {
    getSession(req)
      .then(requireAdministrator)
      .then((session) => {
        const Doc = mongoose.model('Site');
        const data = req.body;
        data.modified = new Date();
        data.userId = session.userId;
        const doc = new Doc(data);
        return Doc.remove({}).exec()
          .then(() => doc.save());
      })
      .then((site) => {
        // copy shortcut and mobile icons
        if (site.shortcutIcon && site.shortcutIcon.data) {
          // strip metadata
          const matches = site.shortcutIcon.data.match(/^(data:.+;base64,)(.*)$/);
          // const metadata = matches[1];
          const base64Data = matches[2];
          fs.writeFile(`${ICON_DIR}/shortcut-icon.png`, base64Data, 'base64',
            (err) => {
              console.error(err);
            });
        }
        if (site.mobileIcon && site.mobileIcon.data) {
          // strip metadata
          const matches = site.mobileIcon.data.match(/^(data:.+;base64,)(.*)$/);
          // const metadata = matches[1];
          const base64Data = matches[2];
          fs.writeFile(`${ICON_DIR}/mobile-app-icon.png`, base64Data, 'base64',
            (err) => {
              console.error(err);
            });
        }
        return site;
      })
      .then(site => res.status(200).json(site))
      .catch(error => catcher(error, res));
  });
}
