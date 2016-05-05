"use strict";
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import db from './db';

const router = express.Router();

// Session

router.post('/sessions', (req, res) => {
  const User = mongoose.model('User');
  const Session = mongoose.model('Session');
  const { email, password } = req.body;
  User.find({ email: email })
    .exec()
    .then(user => {
      bcrypt.compare(password, user.encryptedPassword, (err, res) => {
        if (res) {
          console.log('!!! MATCH');
          const session = new Session({ email: email, lastLogin: new Date() });
          session.save()
            .then(user => res.status(200).json(user))
            .catch(error => res.status(400).json({ error: error }));
        } else {
          console.log('!!! NO MATCH');
          res.status(400).json({ error: "Invalid email or password" });
        }
      });
    });
});

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
  const id = req.params.id;
  const User = mongoose.model('User');
  User.findOneAndUpdate({ _id: id }, req.body)
    .exec()
    .then(user => res.status(200).json(user))
    .catch(error => res.status(400).json({ error: error }));
});

router.delete('/users/:id', (req, res) => {
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
  const User = mongoose.model('User');
  const user = new User(req.body);
  user.save()
    .then(user => res.status(200).json(user))
    .catch(error => res.status(400).json({ error: error }));
});

module.exports = router;
