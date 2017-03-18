import mongoose from 'mongoose';
import moment from 'moment';
import register from './register';
import { authorize, authorizedAdministrator } from './auth';

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
      .then((events) => {
        // separate by dates within the range
        const splitEvents = [];
        events.forEach((event) => {
          const base = { _id: event._id, name: event.name, path: event.path };

          if (moment(event.start).isBetween(start, end) ||
            moment(event.end).isBetween(start, end)) {
            splitEvents.push({
              ...base, id: event._id, start: event.start, end: event.end,
            });
            event.times.forEach((time) => {
              splitEvents.push({
                ...base, id: `${event._id}-1`, start: time.start, end: time.end,
              });
            });
          }

          if (event.dates && event.dates.length > 0) {
            const times = [[
              moment(event.start).format('HH:mm:ss'),
              moment(event.end).format('HH:mm:ss'),
            ]];
            if (event.times) {
              event.times.forEach((time) => {
                times.push([
                  moment(time.start).format('HH:mm:ss'),
                  moment(time.end).format('HH:mm:ss'),
                ]);
              });
            }

            event.dates.map(d => moment(d)).forEach((date, index) => {
              if (date.isBetween(start, end)) {
                times.forEach((time, index2) => {
                  const start2 = moment(`${date.format('YYYY-MM-DD')}T${time[0]}`);
                  const end2 = moment(`${date.format('YYYY-MM-DD')}T${time[1]}`);
                  splitEvents.push({
                    ...base,
                    id: `${event._id}-${index}-${index2}`,
                    start: start2,
                    end: end2,
                  });
                });
              }
            });
          }
        });
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
