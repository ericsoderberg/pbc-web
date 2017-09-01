import mongoose from 'mongoose';
import moment from 'moment-timezone';
import register from './register';
import { getSession, requireAdministrator } from './auth';
import { splitEvents, sortEvents, eventsToCalendarWeeks } from './calendars';
import { catcher } from './utils';

mongoose.Promise = global.Promise;

// /api/resources

const findEventsWithResources = (start, end) => {
  const Event = mongoose.model('Event');
  const query = Event.find();
  // find events withing the time window and having any resources
  const dateCriteria = [
    { end: { $gte: start.toDate() }, start: { $lt: end.toDate() } },
    { dates: { $elemMatch: { $gte: start.toDate(), $lt: end.toDate() } } },
  ];
  query.find({
    resourceIds: { $exists: true, $not: { $size: 0 } }, $or: dateCriteria,
  });
  query.populate({ path: 'resourceIds', select: 'name path' });
  return query.exec();
};

const findEventsWithResource = (id, start, end) => {
  const Event = mongoose.model('Event');
  const query = Event.find();
  // find events withing the time window and having any resources
  const dateCriteria = [
    { end: { $gte: start.toDate() }, start: { $lt: end.toDate() } },
    { dates: { $elemMatch: { $gte: start.toDate(), $lt: end.toDate() } } },
  ];
  query.find({ resourceIds: id, $or: dateCriteria });
  query.populate({ path: 'resourceIds', select: 'name path' });
  return query.exec();
};

export default function (router) {
  router.get('/resources/:id/events', (req, res) => {
    getSession(req)
      .then(requireAdministrator)
      .then(() => {
        const id = req.params.id;
        const queryDate = moment(req.query.date || undefined);
        const start = moment(queryDate).startOf('week');
        const end = moment(queryDate).add(1, 'month');
        return findEventsWithResource(id, start, end)
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
        const id = req.params.id;
        const queryDate = moment(req.query.date || undefined);
        const start = moment(queryDate).startOf('week');
        const end = moment(queryDate).add(1, 'month');
        return findEventsWithResource(id, start, end)
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
        const queryDate = moment(req.query.date || undefined);
        const start = moment(queryDate).startOf('week');
        const end = moment(queryDate).add(1, 'month');
        return findEventsWithResources(start, end)
          // separate by dates and times within the range
          .then(events => splitEvents(events, start, end, true))
          // sort by dates
          .then(events => sortEvents(events))
          .then(events => res.json(events));
      })
      .catch(error => catcher(error, res));
  });

  router.get('/resources/calendar', (req, res) => {
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
        const queryDate = moment(req.query.date || undefined);
        const start = moment(queryDate).startOf('week');
        const end = moment(queryDate).add(1, 'month');
        return findEventsWithResources(start, end)
          // separate by dates and times within the range
          .then(events => splitEvents(events, start, end, true))
          // sort by dates
          .then(events => sortEvents(events))
          // arrange into weeks
          .then(events => eventsToCalendarWeeks(events, start, end, site.timezone))
          .then(weeks => res.json({ weeks }));
      })
      .catch(error => catcher(error, res));
  });

  register(router, {
    category: 'resources',
    modelName: 'Resource',
  });
}
