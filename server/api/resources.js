import mongoose from 'mongoose';
import moment from 'moment';
import register from './register';
import { authorize, authorizedAdministrator } from './auth';
import { splitEvents, sortEvents } from './calendars';

mongoose.Promise = global.Promise;

// /api/resources

export default function (router) {
  router.get('/resources/:id/events', (req, res) => {
    authorize(req, res)
    .then(() => {
      const Event = mongoose.model('Event');
      const id = req.params.id;
      const queryDate = moment(req.query.date || undefined);
      const start = moment(queryDate).startOf('week');
      const end = moment(queryDate).add(1, 'month');

      const query = Event.find();

      // find events withing the time window
      const dateCriteria = [
        { end: { $gte: start.toDate() }, start: { $lt: end.toDate() } },
        { dates: { $gte: start.toDate(), $lt: end.toDate() } },
      ];
      query.find({ resourceIds: id, $or: dateCriteria });

      return query.exec()
      // separate by dates and times within the range
      .then(events => splitEvents(events, start, end))
      // sort by dates
      .then(events => sortEvents(events))
      .then(events => res.json(events));
    })
    .catch(error => {
      console.log('!!!', error);
      res.status(400).json(error);
    });
  });

  register(router, {
    category: 'resources',
    modelName: 'Resource',
    index: {
      authorize: authorizedAdministrator,
    },
    get: {
      authorize: authorizedAdministrator,
    },
    // get: {
    //   transformOut: populate,
    // },
  });
}
