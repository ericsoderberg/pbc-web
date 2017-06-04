import mongoose from 'mongoose';
import moment from 'moment-timezone';
import { getSession, requireAdministrator } from './auth';
import { catcher } from './utils';

mongoose.Promise = global.Promise;

// /api/search

const TYPES = [
  { type: 'page', model: 'Page' },
  { type: 'event', model: 'Event' },
  { type: 'formTemplate', model: 'FormTemplate' },
  { type: 'user', model: 'User' },
  { type: 'library', model: 'Library' },
  { type: 'message', model: 'Message' },
];

export default function (router) {
  router.get('/audit-log', (req, res) => {
    getSession(req)
    .then(requireAdministrator)
    .then(() => {
      const promises = TYPES.map((type) => {
        const Doc = mongoose.model(type.model);
        return Doc.find({ modified: { $exists: true } })
        .select('name userId modified')
        .populate('userId', 'name')
        .sort('-modified')
        .limit(40)
        .exec()
        .then(result => result.map((item) => {
          const data = item.toObject();
          data.type = type.type;
          return data;
        }));
      });

      return Promise.all(promises)
      .then((docs) => {
        // merge and sort
        let items = [];
        docs.forEach((doc) => { items = items.concat(doc); });
        return items.sort((i1, i2) => {
          if (moment(i1.modified).isBefore(moment(i2.modified))) {
            return 1;
          }
          return -1;
        });
      });
    })
    .then((items) => {
      const skip = (req.query.skip ? parseInt(req.query.skip, 10) : 0);
      items = items.slice(skip, skip + 20);
      res.status(200).json(items);
    })
    .catch(error => catcher(error, res));
  });
}
