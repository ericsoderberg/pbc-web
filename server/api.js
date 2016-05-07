"use strict";
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import hat from 'hat';
import db from './db';

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
        email: email,
        lastLogin: new Date(),
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
    .then(doc => res.json(doc))
    .catch(error => res.status(400).json({ error: error }));
  });

  router.put(`/${category}/:id`, (req, res) => {
    authorize(req, res)
    .then(session => {
      const id = req.params.id;
      const Doc = mongoose.model(modelName);
      let data = req.body;
      if (transforms.put) {
        data = transforms.put(data);
      }
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
    if (req.query.q) {
      const searchText = req.query.q;
      const exp = new RegExp(searchText, 'i');
      query = query.or([
        { 'name': exp }
      ]);
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
      if (transforms.post) {
        data = transforms.post(data);
      }
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
  put: encryptPassword,
  post: encryptPassword
});

// Page

register('pages', 'Page');

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

module.exports = router;
