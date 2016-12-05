"use strict";
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import hat from 'hat';
import register from './register';
import { authorizedAdministrator } from './auth';

// /api/users

const encryptPassword = (data) => {
  if (data.password) {
    data.encryptedPassword = bcrypt.hashSync(data.password, 10);
    delete data.password;
  }
  if (! data.administratorDomainId) {
    delete data.administratorDomainId;
    data.$unset = { administratorDomainId: '' };
  }
  return data;
};

const deleteUserRelated = (doc) => {
  const Session = mongoose.model('Session');
  Session.remove({ userId: doc._id }).exec();
  // TODO: unsubscribe from EmailLists
  return doc;
};

export default function (router, transporter) {
  router.post('/users/sign-up', (req, res) => {
    let data = req.body;
    const User = mongoose.model('User');
    // if this is the first user, make them administrator
    User.count()
    .then(count => {
      if (data.password) {
        data.encryptedPassword = bcrypt.hashSync(data.password, 10);
        delete data.password;
      }
      data.created = new Date();
      data.modified = data.created;
      data.administrator = 0 === count;
      const doc = new User(data);
      return doc.save();
    })
    .then(doc => res.status(200).json(doc))
    .catch(error => {
      error = error.toJSON();
      delete error.op.encryptedPassword;
      if (error.errmsg.match(/^E11000/)) {
        error.errmsg = "An account with that email address already exists.";
      }
      return res.status(400).json(error);
    });
  });

  router.post('/users/verify-email', (req, res) => {
    let data = req.body;
    const User = mongoose.model('User');
    const Site = mongoose.model('Site');
    // make sure we have a user with this email
    User.findOne({ email: data.email }).exec()
    .then(user => {
      if (! user) {
        return Promise.reject({
          error: 'There is no account with that email address' });
      }
      // generate a tempmorary authentication token
      user.temporaryToken = hat();
      user.modified = new Date();
      return user.save()
      .then(user => {
        return Site.findOne({}).exec()
        .then(site => {
          const url = `${req.protocol}://${req.get('Host')}` +
            `/verify-email?token=${user.temporaryToken}`;
          const instructions =
`## Email verififcation for ${site.name}

The link below is valid for 2 hours from the time this message was sent.
It will allow sign you in to the ${site.name} web site.


# [Verify email](${url})


`;
          transporter.sendMail({
            from: site.email,
            to: user.email,
            subject: 'Verify Email',
            markdown: instructions
          }, (err, info) => {
            console.log('!!! sendMail', err, info);
          });
        });
      });
    })
    .then(() => res.status(200).send({}))
    .catch(error => res.status(400).json(error));
  });

  register(router, 'users', 'User', {
    authorize: {
      index: authorizedAdministrator
    },
    searchProperties: ['name', 'email'],
    transformIn: {
      put: encryptPassword,
      post: encryptPassword
    },
    transformOut: {
      get: (user) => {
        if (user) {
          user = user.toObject();
          delete user.encryptedPassword;
        }
        return user;
      },
      index: (users) => {
        return users.map(doc => {
          let user = doc.toObject();
          delete user.encryptedPassword;
          return user;
        });
      },
      delete: deleteUserRelated
    }
  });
}
