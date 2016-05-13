"use strict";
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import hat from 'hat';
import moment from 'moment';
import fs from 'fs';
import rmdir from 'rimraf';
import './db';

const FILES_PATH = 'public/files';

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
        token: hat() // better to encrypt this before storing it, someday
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
    if (session._id == id) { /// === doesn't seem to work
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
        res.status(401).json({ error: 'Not authorized' });
        return Promise.reject();
      }
    });
  } else {
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
      let query = Doc.findById(id);
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
      data = (transform.put ? transform.put(data) : data);
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
      query = query.or([
        { 'name': exp }
      ]);
    }
    if (req.query.filter) {
      query.find(JSON.parse(req.query.filter));
    }
    if (req.query.sort) {
      query.sort(req.query.sort);
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
      data = (transform.post ? transform.post(data) : data);
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
  let userData = req.body;
  if (userData.password) {
    userData.encryptedPassword = bcrypt.hashSync(userData.password, 10);
    delete userData.password;
  }
  const doc = new User(userData);
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
register('events', 'Event');
register('resources', 'Resource');
register('messages', 'Message', { except: 'get' });

function messageCompleter (property, value, results, res) {
  if (! results.sent) {
    if ('error' === property) {
      res.status(400).json({ error: value });
      results.sent = true;
    } else {
      results[property] = value;
      results.remaining -= 1;
      if (0 === results.remaining) {
        const message = results.message.toObject();
        message.nextMessage = results.nextMessage;
        message.previousMessage = results.previousMessage;
        message.seriesMessages = results.seriesMessages;
        res.json(message);
        results.sent = true;
      }
    }
  }
}

router.get('/messages/:id', (req, res) => {
  const id = req.params.id;
  const Doc = mongoose.model('Message');
  let results = { remaining: 4 };
  let errors = [];

  // message
  Doc.findById(id).populate({ path: 'seriesId', select: 'name' }).exec()
  .then(message => {

    // nextMessage
    Doc.find({
      library: message.library,
      date: { $gt: message.date },
      series: { $ne: true }
    })
    .sort('date').limit(1).select('name verses').exec()
    .then(doc => messageCompleter('nextMessage', doc[0], results, res))
    .catch(error => messageCompleter('error', error, results, res));

    // previousMessage
    Doc.find({
      library: message.library,
      date: { $lt: message.date },
      series: { $ne: true }
    })
    .sort('-date').limit(1).select('name verses').exec()
    .then(doc => messageCompleter('previousMessage', doc[0], results, res))
    .catch(error => messageCompleter('error', error, results, res));

    messageCompleter('message', message, results, errors, res);
  })
  .catch(error => messageCompleter('error', error, results, res));

  // seriesMessages
  Doc.find({ seriesId: id }).select('name').exec()
  .then(doc => messageCompleter('seriesMessages', doc, results, res))
  .catch(error => messageCompleter('error', error, results, res));
});

register('newsletters', 'Newsletter');
register('form-templates', 'FormTemplate');
register('forms', 'Forms');

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
    const doc = new Doc(req.body);
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
  const Doc = mongoose.model('Event');
  let q = {
    stop: { $gte: start.toDate() },
    start: { $lt: end.toDate() }
  };
  if (req.query.search) {
    const exp = new RegExp(req.query.search, 'i');
    q.name = exp;
  }
  if (req.query.filter) {
    q = { ...q, ...JSON.parse(req.query.filter) };
  }
  let query = Doc.find(q);
  query.sort('start')
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
      console.log('!!! get', files);
      res.download(`${FILES_PATH}/${id}/${files[0]}`);
    }
  });
});

router.delete('/files/:id', (req, res) => {
  authorize(req, res)
  .then(session => {
    const id = req.params.id;
    console.log('!!! delete', id);
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
    console.log('!!! post new file', id);
    let fstream;
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      const dir = `${FILES_PATH}/${id}`;
      fs.mkdir(dir, () => {
        console.log("Uploading: " + filename);
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
