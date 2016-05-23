"use strict";
import express from 'express';
import mongoose from 'mongoose';
import { ObjectID } from 'mongodb';
import bcrypt from 'bcrypt';
import hat from 'hat';
import moment from 'moment';
import fs from 'fs';
import rmdir from 'rimraf';
import './db';
import { render as renderNewsletter } from './newsletter';

const FILES_PATH = 'public/files';
const ID_REGEXP = /^[A-Za-z0-9]+$/;

const router = express.Router();

// Session

router.post('/sessions', (req, res) => {
  const User = mongoose.model('User');
  const Session = mongoose.model('Session');
  const { email, password } = req.body;
  User.findOne({ email: email })
  .exec()
  .then(user => {
    if (user && bcrypt.compareSync(password, user.encryptedPassword)) {
      const session = new Session({
        administrator: user.administrator,
        email: email,
        loginAt: new Date(),
        name: user.name,
        token: hat(), // better to encrypt this before storing it, someday
        userId: user._id
      });
      session.save()
      .then(response => res.status(200).json(session))
      .catch(error => res.status(400).json({ error: error }));
    } else {
      res.status(401).json({error: "Invalid email or password"});
    }
  });
});

router.delete('/sessions/:id', (req, res) => {
  authorize(req, res)
  .then(session => {
    const id = req.params.id;
    if (session._id.equals(id)) { /// === doesn't seem to work
      session.remove()
      .then(() => res.status(200).send());
    } else {
      res.status(401).json({ error: 'Not authorized' });
    }
  });
});

function authorize (req, res) {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.split('=')[1];
    const Session = mongoose.model('Session');
    return Session.findOne({ token: token })
    .exec()
    .then(session => {
      if (session) {
        return session;
      } else {
        console.log('!!! ! authorized no session', token);
        res.status(401).json({ error: 'Not authorized' });
        return Promise.reject();
      }
    });
  } else {
    console.log('!!! ! authorized no authorization');
    res.status(401).json({ error: 'Not authorized' });
    return Promise.reject();
  }
}

// Generic

const register = (category, modelName, options={}) => {
  const transform = options.transform || {};

  if ('get' !== options.except) {
    router.get(`/${category}/:id`, (req, res) => {
      const id = req.params.id;
      const Doc = mongoose.model(modelName);
      const criteria = (ObjectID.isValid(id) && ID_REGEXP.test(id)) ?
        {_id: id} : {path: id};
      let query = Doc.findOne(criteria);
      if (req.query.select) {
        query.select(req.query.select);
      }
      if (options.populate) {
        query = query.populate(options.populate);
      }
      query.exec()
      .then(doc => (transform.get ? transform.get(doc) : doc))
      .then(doc => res.json(doc))
      .catch(error => res.status(400).json({ error: error }));
    });
  }

  router.put(`/${category}/:id`, (req, res) => {
    authorize(req, res)
    .then(session => {
      const id = req.params.id;
      const Doc = mongoose.model(modelName);
      let data = req.body;
      data.modified = new Date();
      data.userId = session.userId;
      data = (transform.put ? transform.put(data, session) : data);
      Doc.findOneAndUpdate({ _id: id }, data)
      .exec()
      .then(doc => res.status(200).json(doc))
      .catch(error => res.status(400).json({ error: error }));
    });
  });

  router.delete(`/${category}/:id`, (req, res) => {
    authorize(req, res)
    .then(session => {
      const id = req.params.id;
      const Doc = mongoose.model(modelName);
      Doc.findById(id)
      .exec()
      .then(doc => {
        doc.remove()
          .then(doc => res.status(200).send());
      })
      .catch(error => res.status(400).json({ error: error }));
    });
  });

  router.get(`/${category}`, (req, res) => {
    const Doc = mongoose.model(modelName);
    let query = Doc.find();
    if (req.query.search) {
      const exp = new RegExp(req.query.search, 'i');
      query.or([
        { 'name': exp }
      ]);
    }
    if (req.query.filter) {
      query.find(JSON.parse(req.query.filter));
    }
    if (req.query.sort) {
      query.sort(req.query.sort);
    }
    if (req.query.select) {
      query.select(req.query.select);
    }
    if (req.query.populate) {
      const populate = JSON.parse(req.query.populate);
      if (Array.isArray(populate)) {
        populate.forEach(pop => query.populate(pop));
      } else {
        query.populate(populate);
      }
    }
    if (req.query.distinct) {
      query.distinct(req.query.distinct);
    } else if (req.query.limit) {
      query.limit(req.query.limit);
    } else {
      query.limit(20);
    }
    query.exec()
    .then(docs => res.json(docs))
    .catch(error => res.status(400).json({ error: error }));
  });

  router.post(`/${category}`, (req, res) => {
    authorize(req, res)
    .then(session => {
      const Doc = mongoose.model(modelName);
      let data = req.body;
      data.created = new Date();
      data.modified = data.created;
      data.userId = session.userId;
      data = (transform.post ? transform.post(data, session) : data);
      const doc = new Doc(data);
      doc.save()
      .then(doc => res.status(200).json(doc))
      .catch(error => res.status(400).json({ error: error }));
    });
  });
};

// User

router.post('/users/sign-up', (req, res) => {
  const User = mongoose.model('User');
  let data = req.body;
  if (data.password) {
    data.encryptedPassword = bcrypt.hashSync(data.password, 10);
    delete data.password;
  }
  data.created = new Date();
  data.modified = data.created;
  const doc = new User(data);
  doc.save()
  .then(doc => res.status(200).json(doc))
  .catch(error => res.status(400).json({ error: error }));
});

const encryptPassword = (data) => {
  if (data.password) {
    data.encryptedPassword = bcrypt.hashSync(data.password, 10);
    delete data.password;
  }
  return data;
};

register('users', 'User', {
  transform: {
    get: (user) => {
      user = user.toObject();
      delete user.encryptedPassword;
      return user;
    },
    put: encryptPassword,
    post: encryptPassword
  }
});

// other

register('pages', 'Page');
register('resources', 'Resource');
register('form-templates', 'FormTemplate');
register('forms', 'Form');
register('email-lists', 'EmailList');

// Messages

register('messages', 'Message', { except: 'get' });

router.get('/messages/:id', (req, res) => {
  const id = req.params.id;
  const Doc = mongoose.model('Message');
  const subFields = 'name verses date path';

  // message
  const criteria = ObjectID.isValid(id) ? {_id: id} : {path: id};
  const query = Doc.findOne(criteria);
  query.populate({ path: 'seriesId', select: 'name' });
  query.exec()
  .then(message => {

    // nextMessage
    const nextPromise = Doc.find({
      library: message.library,
      date: { $gt: message.date },
      series: { $ne: true }
    })
    .sort('date').limit(1).select(subFields).exec();

    // previousMessage
    const previousPromise = Doc.find({
      library: message.library,
      date: { $lt: message.date },
      series: { $ne: true }
    })
    .sort('-date').limit(1).select(subFields).exec();

    // seriesMessages
    const seriesMessagesPromise = Doc.find({ seriesId: message.id })
    .select(subFields).exec();

    return Promise.all([Promise.resolve(message), nextPromise,
      previousPromise, seriesMessagesPromise]);
  })
  .then(docs => {
    let messageData = docs[0].toObject();
    messageData.nextMessage = docs[1][0];
    messageData.previousMessage = docs[2][0];
    messageData.seriesMessages = docs[3];
    res.json(messageData);
  })
  .catch(error => res.status(400).json({ error: error }));
});

// Newsletter

router.post('/newsletters/render', (req, res) => {
  const Newsletter = mongoose.model('Newsletter');
  const newsletter = new Newsletter(req.body);
  const Message = mongoose.model('Message');
  const Event = mongoose.model('Event');
  const messageFields = 'name verses date path author';

  // nextMessage
  let nextPromise;
  if (newsletter.date && newsletter.library) {
    nextPromise = Message.find({
      library: newsletter.library,
      date: { $gt: newsletter.date },
      series: { $ne: true }
    })
    .sort('date').limit(1).select(messageFields).exec();
  } else {
    nextPromise = Promise.resolve([]);
  }

  // previousMessage
  let previousPromise;
  if (newsletter.date && newsletter.library) {
    previousPromise = Message.find({
      library: newsletter.library,
      date: { $lt: newsletter.date },
      series: { $ne: true }
    })
    .sort('-date').limit(1).select(messageFields).exec();
  } else {
    previousPromise = Promise.resolve([]);
  }

  // events
  let eventsPromise;
  if (newsletter.date && newsletter.calendar) {
    const date = moment(newsletter.date);
    eventsPromise = Event.find({
      calendar: newsletter.calendar,
      start: {
        $gt: date.toDate(),
        $lt: moment(date).add(2, 'months').toDate()
      }
    }).exec();
  } else {
    eventsPromise = Promise.resolve([]);
  }

  Promise.all([Promise.resolve(newsletter), nextPromise,
    previousPromise, eventsPromise])
  .then(docs => {
    let newsletterData = docs[0].toObject();
    newsletterData.nextMessage = docs[1][0];
    newsletterData.previousMessage = docs[2][0];
    newsletterData.events = docs[3];
    res.send(renderNewsletter(newsletterData));
  })
  .catch(error => res.status(400).json({ error: error }));
});

register('newsletters', 'Newsletter');

// Site

router.get('/site', (req, res) => {
  const Doc = mongoose.model('Site');
  Doc.findOne({})
  .exec()
  .then(doc => res.json(doc))
  .catch(error => res.status(400).json({ error: error }));
});

router.post('/site', (req, res) => {
  authorize(req, res)
  .then(session => {
    const Doc = mongoose.model('Site');
    let data = req.body;
    data.modified = new Date();
    data.userId = session.userId;
    const doc = new Doc(data);
    Doc.remove({})
    .exec()
    .then(() => doc.save())
    .then(doc => res.status(200).json(doc))
    .catch(error => res.status(400).json({ error: error }));
  });
});

// Calendar

router.get('/calendar', (req, res) => {
  const date = moment(req.query.date || undefined);
  const start = moment(date).startOf('month').startOf('week');
  const end = moment(date).endOf('month').endOf('week');
  const previous = moment(date).subtract(1, 'month');
  const next = moment(date).add(1, 'month');
  // find all events withing the time window
  const Event = mongoose.model('Event');
  let q = {
    end: { $gte: start.toDate() },
    start: { $lt: end.toDate() }
  };
  if (req.query.search) {
    const exp = new RegExp(req.query.search, 'i');
    q.name = exp;
  }
  if (req.query.filter) {
    q = { ...q, ...JSON.parse(req.query.filter) };
  }
  Event.find(q)
  .sort('start')
  .exec()
  .then(docs => {
    res.status(200).json({
      date: date,
      end: end,
      events: docs,
      next: next,
      previous: previous,
      start: start
    });
  })
  .catch(error => res.status(400).json({ error: error }));
});

// Events

// Supporting functions for /events/resources

function eventMoments (event) {
  let result = [{
    start: moment(event.start),
    end: moment(event.end)
  }];
  if (event.times) {
    result.concat(event.times.map(time => ({
      start: moment(time.start),
      end: moment(time.end)
    })));
  }
  if (event.dates) {
    let recurrence = [];
    event.dates.forEach(date => {
      result.forEach(time => {
        recurrence.push({
          start: moment(date).set({
            hour: time.start.hour(),
            minute: time.start.minute()
          }),
          end: moment(date).set({
            hour: time.end.hour(),
            minute: time.end.minute()
          })
        });
      });
    });
    result = result.concat(recurrence);
  }
  return result;
}

function overlapsMoments (event, moments) {
  const moments2 = eventMoments(event);
  return moments.some(moment => {
    return moments2.some(moment2 => {
      return (moment.end.isAfter(moment2.start) &&
        moment.start.isBefore(moment2.end));
    });
  });
}

function overlappingEvents (event) {
  const Event = mongoose.model('Event');
  const moments = eventMoments(event);
  return Event.find({ _id: { $ne: event._id } }).exec()
  .then(events => events.filter(event2 => overlapsMoments(event2, moments)));
}

function resourceIdsWithEvents (events) {
  let resourceIdsEvents = {}; // _id => [{ _id: <event id>, name: <event name }]
  events.forEach(event2 => {
    if (event2.resourceIds) {
      event2.resourceIds.forEach(resourceId => {
        const stringId = resourceId.toString();
        if (! resourceIdsEvents[stringId]) {
          resourceIdsEvents[stringId] = [];
        }
        resourceIdsEvents[stringId].push({ _id: event2._id, name: event2.name });
      });
    }
  });
  return resourceIdsEvents;
}

function resourcesWithEvents (resourceIdsEvents) {
  const Resource = mongoose.model('Resource');
  return Resource.find({}).exec()
  .then(resources => {
    // Decorate with the overlapping events used by the resources.
    return resources.map(resource => {
      // Annotated with events already using them
      let object = resource.toObject();
      object.events = resourceIdsEvents[object._id.toString()];
      return object;
    });
  });
}

router.post('/events/resources', (req, res) => {
  authorize(req, res)
  // Get all events that overlap this event.
  .then(session => {
    const Event = mongoose.model('Event');
    const event = new Event(req.body);
    return overlappingEvents(event);
  })
  // Collect the resourceIds they use.
  .then(resourceIdsWithEvents)
  // Get all resources and annotate with events.
  .then(resourcesWithEvents)
  .then(resources => res.status(200).json(resources))
  .catch(error => res.status(400).json({ error: error }));
});

// Supporting functions for /events/unavailable-dates

function timeInHours (time) {
  const start = moment(time.start);
  const end = moment(time.end);
  return {
    start: start.hour() + (start.minute() / 60.0),
    end: end.hour() + (end.minute() / 60.0)
  };
}

function eventInHours (event) {
  let hours = [timeInHours(event)];
  if (event.times) {
    hours = hours.concat(event.times.map(timeInHours));
  }
  return hours;
}

function hoursOverlap (event2, hours) {
  const hours2 = eventInHours(event2);
  return hours.some(hour => (
    hours2.some(hour2 => (hour2.end > hour.start && hour2.start < hour.end))
  ));
}

function resourcesOverlap (event2, resourceIds) {
  return resourceIds.some(resourceId => (
    event2.resourceIds.some(resourceId2 => resourceId.equals(resourceId2))
  ));
}

function eventDates (event) {
  let dates = [event.start];
  return dates.concat(event.dates || []);
}

router.post('/events/unavailable-dates', (req, res) => {
  authorize(req, res)
  .then(session => {
    const Event = mongoose.model('Event');
    const event = new Event(req.body);

    const hours = eventInHours(event);
    const resourceIds = event.resourceIds;

    // Find all events using the resources this event is using at the same
    // times of day.
    return Event.find({ _id: { $ne: event._id } }).exec()
    .then(events => {
      // events using a same resource
      return events.filter(event2 => resourcesOverlap(event2, resourceIds))
      // events at the same time of day
      .filter(event2 => hoursOverlap(event2, hours))
      .map(eventDates);
    });
  })
  .then(unavailableDatess => {
    let unavailableDates = [];
    unavailableDatess.forEach(dates => {
      unavailableDates = unavailableDates.concat(dates);
    });
    return unavailableDates;
  })
  .then(unavailableDates => res.status(200).json(unavailableDates))
  .catch(error => res.status(400).json({ error: error }));
});

register('events', 'Event');

// Files

router.get('/files/:id/:name', (req, res) => {
  const { id, name } = req.params;
  res.download(`${FILES_PATH}/${id}/${name}`);
});

router.get('/files/:id', (req, res) => {
  const id = req.params.id;
  fs.readdir(`${FILES_PATH}/${id}`, (err, files) => {
    if (err) {
      res.status(400).json({ error: error });
    } else {
      res.download(`${FILES_PATH}/${id}/${files[0]}`);
    }
  });
});

router.delete('/files/:id', (req, res) => {
  authorize(req, res)
  .then(session => {
    const id = req.params.id;
    rmdir(`${FILES_PATH}/${id}`, (error) => {
      if (error) {
        res.status(400).json({ error: error });
      } else {
        res.status(200).send();
      }
    });
  });
});

router.get('/files', (req, res) => {
  authorize(req, res)
  .then(session => {
    fs.readdir(`${FILES_PATH}`, (error, files) => {
      if (error) {
        res.status(400).json({ error: error });
      } else {
        files = files.map(id => ({ _id: id }));
        res.status(200).json(files);
      }
    });
  });
});

router.post('/files', (req, res) => {
  authorize(req, res)
  .then(session => {
    const id = new mongoose.Types.ObjectId();
    let fstream;
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      const dir = `${FILES_PATH}/${id}`;
      fs.mkdir(dir, () => {
        fstream = fs.createWriteStream(`${dir}/${filename}`);
        file.pipe(fstream);
        fstream.on('close', function () {
          res.json({ _id: id, name: filename, type: mimetype });
        });
      });
    });
    req.pipe(req.busboy);
  });
});

module.exports = router;
