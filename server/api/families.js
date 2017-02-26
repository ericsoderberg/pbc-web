"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import register from './register';
import { authorize, authorizedAdministrator } from './auth';
import { useOrCreateSession } from './sessions';
import { findOrCreateUser } from './users';

// /api/families

export default function (router) {
  register(router, {
    category: 'families',
    modelName: 'Family',
    omit: ['post', 'put'], // special handling for POST and PUT of family below
    index: {
      authorize: authorizedAdministrator,
      populate: [
        { path: 'adults.userId', select: 'name email' }
      ]
    },
    get: {
      populate: [
        { path: 'adults.userId', select: 'name email phone' }
      ]
    }
  });

  router.post(`/families`, (req, res) => {
    authorize(req, res, false) // don't require session yet
    .then(session => {
      const data = req.body;
      const { email, name } = data.adults[0];
      return useOrCreateSession(session, email, name);
    })
    .then(session => {
      const Family = mongoose.model('Family');
      let data = req.body;
      data.created = new Date();
      data.modified = data.created;
      // Find or create users for adults
      const promises = [];
      data.adults.forEach(adult => {
        promises.push(findOrCreateUser(adult.email, adult.name)
        .then(user => {
          adult.userId = user._id;
        }));
      });
      return Promise.all(promises)
      .then(() => {
        const family = new Family(data);
        return family.save();
      })
      .then(family => ({ session, family }));
    })
    // .then(sendEmails(req, transporter))
    .then(context => {
      const { session } = context;
      if (! session.loginAt) {
        // we created this session here, return it
        res.status(200).json(session);
      } else {
        res.status(200).send({});
      }
    })
    .catch(error => {
      console.log('!!! post family catch', error);
      res.status(400).json(error);
    });
  });

  router.put(`/families/:id`, (req, res) => {
    authorize(req, res)
    .then(session => {
      const id = req.params.id;
      const Family = mongoose.model('Family');
      return Family.findOne({ _id: id }).exec()
      .then(family => ({ session, family }));
    })
    .then(context => {
      const { family } = context;
      let data = req.body;
      data.modified = new Date();
      // Find or create users for adults as needed
      const promises = [];
      data.adults.forEach(adult => {
        if (adult.email || adult.name) {
          promises.push(findOrCreateUser(adult.email, adult.name)
          .then(user => {
            adult.userId = user._id;
          }));
        }
      });
      return Promise.all(promises)
      .then(() => {
        return family.update(data);
      })
      .then(family => ({ ...context, family }));
    })
    // .then(sendEmails(req, transporter))
    .then(context => res.status(200).json(context.family))
    .catch(error => {
      console.log('!!! post family catch', error);
      res.status(400).json(error);
    });
  });
}
