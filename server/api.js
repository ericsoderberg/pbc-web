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

const register = (category, modelName, transforms={}) => {

  router.get(`/${category}/:id`, (req, res) => {
    const id = req.params.id;
    const Doc = mongoose.model(modelName);
    Doc.findById(id)
    .exec()
    .then(doc => (transforms.get ? transforms.get(doc) : doc))
    .then(doc => res.json(doc))
    .catch(error => res.status(400).json({ error: error }));
  });

  router.put(`/${category}/:id`, (req, res) => {
    authorize(req, res)
    .then(session => {
      const id = req.params.id;
      const Doc = mongoose.model(modelName);
      let data = req.body;
      data = (transforms.put ? transforms.put(data) : data);
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
    query.limit(20)
    .exec()
    .then(docs => res.json(docs))
    .catch(error => res.status(400).json({ error: error }));
  });

  router.post(`/${category}`, (req, res) => {
    authorize(req, res)
    .then(session => {
      const Doc = mongoose.model(modelName);
      let data = req.body;
      data = (transforms.post ? transforms.post(data) : data);
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
  get: (user) => {
    user = user.toObject();
    delete user.encryptedPassword;
    return user;
  },
  put: encryptPassword,
  post: encryptPassword
});

// other

register('pages', 'Page');
register('events', 'Event');
register('resources', 'Resource');
register('messages', 'Message');
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
  Doc.find({
    stop: { $gte: start.toDate() },
    start: { $lt: end.toDate() }
  })
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
