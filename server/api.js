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
    console.log('!!! delete session', session._id, id);
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

// User

router.get('/users/:id', (req, res) => {
  const id = req.params.id;
  const User = mongoose.model('User');
  User.findById(id)
  .exec()
  .then(user => res.json(user))
  .catch(error => res.status(400).json({ error: error }));
});

router.put('/users/:id', (req, res) => {
  authorize(req, res)
  .then(session => {
    const id = req.params.id;
    const User = mongoose.model('User');
    let userData = req.body;
    if (userData.password) {
      userData.encryptedPassword = bcrypt.hashSync(userData.password, 10);
      delete userData.password;
    }
    User.findOneAndUpdate({ _id: id }, userData)
    .exec()
    .then(user => res.status(200).json(user))
    .catch(error => res.status(400).json({ error: error }));
  });
});

router.delete('/users/:id', (req, res) => {
  authorize(req, res)
  .then(session => {
    const id = req.params.id;
    const User = mongoose.model('User');
    User.findById(id)
    .exec()
    .then(user => {
      user.remove()
        .then(user => res.status(200).send());
    })
    .catch(error => res.status(400).json({ error: error }));
  });
});

router.get('/users', (req, res) => {
  const User = mongoose.model('User');
  let query = User.find();
  if (req.query.q) {
    const searchText = req.query.q;
    const exp = new RegExp(searchText, 'i');
    query = query.or([
      { 'name': exp },
      { 'email': exp }
    ]);
  }
  query.limit(20)
  .exec()
  .then(docs => res.json(docs))
  .catch(error => res.status(400).json({ error: error }));
});

router.post('/users', (req, res) => {
  authorize(req, res)
  .then(session => {
    const User = mongoose.model('User');
    let userData = req.body;
    if (userData.password) {
      userData.encryptedPassword = bcrypt.hashSync(userData.password, 10);
      delete userData.password;
      console.log('!!! post user', userData);
    }
    const user = new User(userData);
    user.save()
    .then(user => res.status(200).json(user))
    .catch(error => res.status(400).json({ error: error }));
  });
});

module.exports = router;
