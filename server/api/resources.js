import mongoose from 'mongoose';
import moment from 'moment';
import register from './register';
import { authorize, authorizedAdministrator } from './auth';

mongoose.Promise = global.Promise;

// /api/resources

// const populate = (resource, req) => {
//   if (resource && req.query.populate) {
//     // get upcoming events
//     const Event = mongoose.model('Event');
//   }
//   return resource;
// };

export default function (router) {
  router.get('/resources/:id/events', (req, res) => {
    authorize(req, res)
    .then(() => {
      const Event = mongoose.model('Event');
      const id = req.params.id;
      const queryDate = moment(req.query.date || undefined);
      const start = moment(queryDate).startOf('week');
      const end = moment(queryDate).add(21, 'days');

      const query = Event.find();

      // find events withing the time window
      const dateCriteria = [
        { end: { $gte: start.toDate() }, start: { $lt: end.toDate() } },
        { dates: { $gte: start.toDate(), $lt: end.toDate() } },
      ];
      query.find({ resourceId: id, $or: dateCriteria });

      return query.exec()
      .then((events) => {
        // separate by dates within the range
        const splitEvents = [];
        events.forEach((event) => {
          const base = {
            name: event.name, path: event.path, times: event.times,
          };
          if (moment(event.start).isBetween(start, end) ||
            moment(event.end).isBetween(start, end)) {
            splitEvents.push({ ...base, start: event.start, end: event.end });
          }
          (event.dates || []).forEach((date) => {
            if (moment(date).isBetween(start, end)) {
              const start2 = moment(`${date.format('YYYY-MM-DD')}T${start.format('HH:mm:ss')}`);
              const end2 = moment(`${date.format('YYYY-MM-DD')}T${end.format('HH:mm:ss')}`);
              splitEvents.push({ ...base, start: start2, end: end2 });
            }
          });
        });
        console.log('!!!', id, start, end, splitEvents);
        return splitEvents;
      })
      // sort by dates
      .then(events => events.sort((e1, e2) => {
        if (moment(e1.start).isBefore(moment(e2.start))) {
          return -1;
        }
        return 1;
      }))
      .then(events => res.json(events));
    })
    .catch(error => res.status(400).json(error));
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
