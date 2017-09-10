import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const ALLOWED_POST_ORIGINS =
  ['https://www.pbc.org', 'https://test.pbc.org', 'http://localhost:8765',
    'http://localhost:8091'];

export function getSession(req) {
  // verify Origin, to avoid CSRF
  const method = req.method;
  const origin = req.headers.origin;
  const authorization = req.headers.authorization;
  if (authorization &&
    (method !== 'POST' || ALLOWED_POST_ORIGINS.indexOf(origin) !== -1)) {
    const token = authorization.split('=')[1];
    const Session = mongoose.model('Session');
    return Session.findOne({ token })
      .populate('userId', 'email name administrator domainIds')
      .exec();
  }
  return Promise.resolve(undefined);
}

export function requireSession(session) {
  return session ? Promise.resolve(session) : Promise.reject({ status: 403 });
}

export function requireAdministrator(session) {
  return (session && session.userId.administrator) ?
    Promise.resolve(session) : Promise.reject({ status: 403 });
}

export function requireSomeAdministrator(session) {
  return (session && (session.userId.administrator ||
    session.userId.domainIds.length > 0)) ?
    Promise.resolve(session) : Promise.reject({ status: 403 });
}

export function allowAnyone(session) {
  return session;
}

export function requireDomainAdministrator(context, domainId) {
  const { session } = context;
  return (session && (session.userId.administrator ||
    (session.userId.domainIds &&
      session.userId.domainIds.some(id => id.equals(domainId))))) ?
    Promise.resolve(context) : Promise.reject({ status: 403 });
}

export function requireDomainAdministratorOrUser(context, domainId, userId) {
  const { session } = context;
  return (session && (session.userId.administrator ||
    (session.userId.domainIds &&
      session.userId.domainIds.some(id => id.equals(domainId))) ||
    session.userId._id.equals(userId))) ?
    Promise.resolve(context) : Promise.reject({ status: 403 });
}

// export function authorizedAdministrator(session) {
//   if (session && session.userId.administrator) {
//     return {};
//   }
//   return { name: false };
// }

export function authorizedDomainAdministrator(session) {
  if (session &&
    (session.userId.administrator ||
      (session.userId.domainIds && session.userId.domainIds.length > 0))) {
    return {};
  }
  return { name: false };
}

export function authorizedForDomain(session) {
  if (session) {
    if (session.userId.administrator) {
      return {};
    } else if (session.userId.domainIds) {
      return { domainId: { $in: session.userId.domainIds } };
    }
  }
  return { name: false };
}

export function authorizedForDomainOrSelf(session) {
  if (session && session.userId.administrator) {
    return {};
  } else if (session && session.userId.domainIds) {
    return { $or: [
      { domainId: { $in: session.userId.domainIds } },
      { userId: session.userId },
    ] };
  } else if (session) {
    return { userId: session.userId };
  }
  return { name: false };
}
