"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;

const ALLOWED_POST_ORIGINS =
  ['https://www.pbc.org', 'https://test.pbc.org', 'http://localhost:8080'];

export function authorize (req, res, required=true) {
  // verify Origin, to avoid CSRF
  const method = req.method;
  const origin = req.headers.origin;
  const authorization = req.headers.authorization;
  if (authorization &&
    (method !== 'POST' || ALLOWED_POST_ORIGINS.indexOf(origin) !== -1)) {
    const token = authorization.split('=')[1];
    const Session = mongoose.model('Session');
    return Session.findOne({ token: token })
    .exec()
    .then(session => {
      if (session || ! required) {
        return session;
      } else {
        console.log('!!! ! authorized no session', token);
        res.status(401).json({ error: 'Not authorized' });
        return Promise.reject();
      }
    });
  } else if (! required) {
    return Promise.resolve(undefined);
  } else {
    console.log('!!! ! authorized no authorization');
    res.status(401).json({ error: 'Not authorized' });
    return Promise.reject();
  }
}

export function authorizedAdministrator (session) {
  if (session && session.administrator) {
    return {};
  } else {
    return { name: false };
  }
}

export function authorizedForDomain (session) {
  if (session && session.administrator) {
    return {};
  } else if (session && session.administratorDomainId) {
    return { domainId: session.administratorDomainId };
  } else {
    return { name: false };
  }
}

export function authorizedForDomainOrSelf (session) {
  if (session && session.administrator) {
    return {};
  } else if (session && session.administratorDomainId) {
    return { domainId: session.administratorDomainId };
  } else if (session) {
    return { userId: session.userId };
  } else {
    return { name: false };
  }
}
