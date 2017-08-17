import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import hat from 'hat';
import moment from 'moment-timezone';
import { getSession, requireSession } from './auth';
import { createUser } from './users';

mongoose.Promise = global.Promise;

// /api/sessions

export function createSession(user) {
  const Session = mongoose.model('Session');
  const data = {
    loginAt: new Date(),
    token: hat(), // better to encrypt this before storing it, someday
    userId: user._id,
  };
  const session = new Session(data);
  return session.save()
    .then(sessionSaved => Session.findOne({ token: sessionSaved.token })
      .populate('userId', 'email name administrator domainIds phone')
      .exec(),
    );
}

export default function (router) {
  router.post('/sessions', (req, res) => {
    const User = mongoose.model('User');
    const { email, password } = req.body;
    const emailRegexp = new RegExp(`^${email}`, 'i');
    User.findOne({ email: emailRegexp })
      .exec()
      .then((user) => {
        if (user && user.encryptedPassword &&
          bcrypt.compareSync(password, user.encryptedPassword)) {
          return createSession(user);
        }
        return Promise.reject();
      })
      .then(session => res.status(200).json(session))
      .catch(() => res.status(401).json({ error: 'Invalid email or password' }));
  });

  // This is used when resetting a password
  router.post('/sessions/token', (req, res) => {
    const User = mongoose.model('User');
    const { token } = req.body;
    const date = moment().subtract(2, 'hours');
    User.findOne({
      temporaryToken: token,
      modified: { $gt: date.toString() },
    }).exec()
      .then((user) => {
        user.temporaryToken = undefined;
        user.verified = true;
        return user.save();
      })
      .then(user => createSession(user))
      .then(session => res.status(200).json(session))
      .catch(() => res.status(400).json({}));
  });

  router.delete('/sessions/:id', (req, res) => {
    getSession(req)
      .then(requireSession)
      .then((session) => {
        const id = req.params.id;
        if (session._id.equals(id)) {
          return session.remove();
        }
        return Promise.reject();
      })
      .then(() => res.status(200).send())
      .catch(() => res.status(401).json({ error: 'Not authorized' }));
  });
}

export function createUserAndSession(userData) {
  return createUser(userData)
    .then((user) => {
      // create a new session
      const Session = mongoose.model('Session');
      const newSession = new Session({
        token: hat(), // better to encrypt this before storing it, someday
        userId: user._id,
      });
      return newSession.save()
        .then(saveSession => Session.findOne({ token: saveSession.token })
          .populate('userId', 'email name administrator domainIds phone')
          .exec()
          .then(session => ({ session, user })),
        );
    });
}
