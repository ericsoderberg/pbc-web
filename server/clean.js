"use strict";
// import fs from 'fs';
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import fs from 'fs';
import './db';
import { FILES_PATH } from './api/files';

const TRASH_PATH = '/tmp/trash';

const Page = mongoose.model('Page');
const Message = mongoose.model('Message');

fs.mkdir(TRASH_PATH, () => {
  // Remove any files that aren't referenced by any message or page
  fs.readdir(FILES_PATH, (err, ids) => {
    let counts = { total: ids.length, cleaned: 0, errors: 0 };
    const promises = ids.map((id, index) => {
      // see if we are using this file in a Message
      return Message.findOne({
        'files._id': { $eq: mongoose.Types.ObjectId(id) }
      }).exec()
      .then(message => {
        if (! message) {
          // see if we are using this file in a Page
          return Page.findOne({
            'sections.files._id': { $eq: mongoose.Types.ObjectId(id) }
          }).exec()
          .then(page => {
            if (! page) {
              // Looks like it's not being used, move it to the trash
              fs.rename(`${FILES_PATH}/${id}`, `${TRASH_PATH}/${id}`,
                (error) => console.log('!!! rename error', error));
              counts.cleaned += 1;
            }
          });
        }
      })
      .catch(error => {
        counts.errors += 1;
        console.log('!!! catch', id, error);
      });
    });
    Promise.all(promises)
    .then(() => console.log('Finished', counts,
      `Cleaned files were moved to ${TRASH_PATH}.`))
    .catch(error => console.log('!!! clean catch', error, error.stack));
  });
});
