import mongoose from 'mongoose';
import moment from 'moment-timezone';
import register from './register';
import { getSession, requireAdministrator } from './auth';
import { splitEvents, sortEvents, eventsToCalendarWeeks } from './calendars';
import { catcher } from './utils';

mongoose.Promise = global.Promise;

// /api/resources

export default function (router) {
  router.get('/resources/:id/events', (req, res) => {
    getSession(req)
    .then(requireAdministrator)
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
    .catch(error => catcher(error, res));
  });

  router.get('/resources/:id/calendar', (req, res) => {
    getSession(req)
    .then(requireAdministrator)
    // get site so we can get timezone
    .then((session) => {
      const Site = mongoose.model('Site');
      return Site.findOne({}).exec()
      .then(site => ({ session, site }));
    })
    .then((context) => {
      const { site } = context;
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
      // arrange into weeks
      .then(events => eventsToCalendarWeeks(events, start, end, site.timezone))
      .then(weeks => res.json({ weeks }));
    })
    .catch(error => catcher(error, res));
  });

  router.get('/resources/events', (req, res) => {
    getSession(req)
    .then(requireAdministrator)
    .then(() => {
      const Event = mongoose.model('Event');
      const queryDate = moment(req.query.date || undefined);
      const start = moment(queryDate).startOf('week');
      const end = moment(queryDate).add(1, 'month');

      const query = Event.find();

      // find events withing the time window
      const dateCriteria = [
        { end: { $gte: start.toDate() }, start: { $lt: end.toDate() } },
        { dates: { $gte: start.toDate(), $lt: end.toDate() } },
      ];
      query.find({ $or: dateCriteria }); // TODO: restrict to events with resources
      query.populate({ path: 'resourceIds', select: 'name path' });

      return query.exec()
      // remove events without resources TODO: do in filter above
      .then((events) => {
        const eventsWithResources = [];
        events.forEach((event) => {
          if (event.resourceIds && event.resourceIds.length > 0) {
            eventsWithResources.push(event);
          }
        });
        return eventsWithResources;
      })
      // separate by dates and times within the range
      .then(events => splitEvents(events, start, end, true))
      // sort by dates
      .then(events => sortEvents(events))
      .then(events => res.json(events));
    })
    .catch(error => catcher(error, res));
  });

  register(router, {
    category: 'resources',
    modelName: 'Resource',
  });
}
