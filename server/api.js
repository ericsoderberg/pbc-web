"use strict";
import express from 'express';
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
// import { ObjectID } from 'mongodb';
import bcrypt from 'bcrypt';
import hat from 'hat';
import moment from 'moment';
import fs from 'fs';
import rmdir from 'rimraf';
import nodemailer from 'nodemailer';
import { markdown } from 'nodemailer-markdown';
import './db';
import { render as renderNewsletter } from './newsletter';

const transporter = nodemailer.createTransport({
  direct: true
});
transporter.use('compile', markdown());

const FILES_PATH = 'public/files';
const ID_REGEXP = /^[0-9a-fA-F]{24}$/;

const router = express.Router();

// Session

function createSession (user) {
  const Session = mongoose.model('Session');
  const data = {
    administrator: user.administrator,
    administratorDomainId: user.administratorDomainId,
    email: user.email,
    loginAt: new Date(),
    name: user.name,
    token: hat(), // better to encrypt this before storing it, someday
    userId: user._id
  };
  const session = new Session(data);
  return session.save();
}

router.post('/sessions', (req, res) => {
  const User = mongoose.model('User');
  const { email, password } = req.body;
  User.findOne({ email: email })
  .exec()
  .then(user => {
    if (user && user.encryptedPassword &&
      bcrypt.compareSync(password, user.encryptedPassword)) {
      return createSession(user);
    } else {
      return Promise.reject();
    }
  })
  .then(session => res.status(200).json(session))
  .catch(error => res.status(401).json({error: "Invalid email or password"}));
});

// This is used when resetting a password
router.post('/sessions/token', (req, res) => {
  const User = mongoose.model('User');
  const { token } = req.body;
  const date = moment().subtract(2, 'hours');
  User.findOne({
    temporaryToken: token,
    modified: { $gt: date.toString() }
  }).exec()
  .then(user => {
    user.temporaryToken = undefined;
    user.verified = true;
    return user.save();
  })
  .then(user => createSession(user))
  .then(session => res.status(200).json(session))
  .catch(error => res.status(400).json({}));
});

router.delete('/sessions/:id', (req, res) => {
  authorize(req, res)
  .then(session => {
    const id = req.params.id;
    if (session._id.equals(id)) {
      return session.remove();
    } else {
      Promise.reject();
    }
  })
  .then(() => res.status(200).send())
  .catch(error => res.status(401).json({ error: 'Not authorized' }));
});

function authorize (req, res, required=true) {
  const authorization = req.headers.authorization;
  if (authorization) {
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

function authorizedAdministrator (session) {
  if (session && session.administrator) {
    return {};
  } else {
    return { name: false };
  }
}

function authorizedForDomain (session) {
  if (session && session.administrator) {
    return {};
  } else if (session && session.administratorDomainId) {
    return { domainId: session.administratorDomainId };
  } else {
    return { name: false };
  }
}

function authorizedForDomainOrSelf (session) {
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

function unsetDomainIfNeeded (data) {
  if (! data.domainId) {
    delete data.domainId;
    data.$unset = { domainId: '' };
  }
  return data;
}

// Generic

function addPopulate (query, populate) {
  if (Array.isArray(populate)) {
    populate.forEach(pop => query.populate(pop));
  } else {
    query.populate(populate);
  }
}

const register = (category, modelName, options={}) => {
  const transformIn = options.transformIn || {};
  const transformOut = options.transformOut || {};
  let methods = options.methods || ['get', 'put', 'delete', 'index', 'post'];
  if (options.omit) {
    methods = methods.filter(m => ! options.omit.some(o => o === m));
  }

  if (methods.indexOf('get') >= 0) {
    router.get(`/${category}/:id`, (req, res) => {
      const id = req.params.id;
      const Doc = mongoose.model(modelName);
      const criteria = ID_REGEXP.test(id) ?
        {_id: id} : {path: id};
      let query = Doc.findOne(criteria);
      if (req.query.select) {
        query.select(req.query.select);
      }
      if (req.query.populate) {
        const populate = JSON.parse(req.query.populate);
        if (true === populate) {
          // populate from options
          if (options.populate && options.populate.get) {
            addPopulate(query, options.populate.get);
          }
        } else {
          addPopulate(query, populate);
        }
      } else if (options.populate && options.populate.get) {
        addPopulate(query, options.populate.get);
      }
      query.exec()
      .then(doc => (transformOut.get ? transformOut.get(doc, req) : doc))
      .then(doc => res.json(doc))
      .catch(error => res.status(400).json(error));
    });
  }

  if (methods.indexOf('put') >= 0) {
    router.put(`/${category}/:id`, (req, res) => {
      authorize(req, res)
      .then(session => {
        const id = req.params.id;
        const Doc = mongoose.model(modelName);
        let data = req.body;
        data.modified = new Date();
        data.userId = session.userId;
        data = (transformIn.put ? transformIn.put(data, session) : data);
        Doc.findOneAndUpdate({ _id: id }, data)
        .exec()
        .then(doc => (transformOut.put ? transformOut.put(doc, req) : doc))
        .then(doc => res.status(200).json(doc))
        .catch(error => res.status(400).json(error));
      });
    });
  }

  if (methods.indexOf('delete') >= 0) {
    router.delete(`/${category}/:id`, (req, res) => {
      authorize(req, res)
      .then(session => {
        const id = req.params.id;
        const Doc = mongoose.model(modelName);
        Doc.findById(id)
        .exec()
        .then(doc => doc.remove())
        .then(doc => (transformOut.delete ? transformOut.delete(doc, req) : doc))
        .then(() => res.status(200).send())
        .catch(error => res.status(400).json(error));
      });
    });
  }

  if (methods.indexOf('index') >= 0) {
    router.get(`/${category}`, (req, res) => {
      authorize(req, res, false)
      .then(session => {
        const Doc = mongoose.model(modelName);
        const searchProperties = options.searchProperties || ['name'];
        let query = Doc.find();
        if (options.authorize && options.authorize.index) {
          query.find(options.authorize.index(session));
        }
        if (req.query.search) {
          const exp = new RegExp(req.query.search, 'i');
          query.or(searchProperties.map(property => {
            let obj = {};
            obj[property] = exp;
            return obj;
          }));
        }
        if (req.query.filter) {
          query.find(JSON.parse(req.query.filter));
        }
        if (req.query.sort) {
          query.sort(req.query.sort);
        }
        if (req.query.select) {
          query.select(req.query.select);
        }
        if (req.query.populate) {
          const populate = JSON.parse(req.query.populate);
          if (true === populate) {
            // populate from options
            if (options.populate && options.populate.index) {
              addPopulate(query, options.populate.index);
            }
          } else {
            addPopulate(query, populate);
          }
        }
        if (req.query.distinct) {
          query.distinct(req.query.distinct);
        } else if (req.query.limit) {
          query.limit(parseInt(req.query.limit, 10));
        } else {
          query.limit(20);
        }
        if (req.query.skip) {
          query.skip(parseInt(req.query.skip, 10));
        }
        query.exec()
        .then(docs => (transformOut.index ? transformOut.index(docs, req) : docs))
        .then(docs => res.json(docs))
        .catch(error => res.status(400).json(error));
      });
    });
  }

  if (methods.indexOf('post') >= 0) {
    router.post(`/${category}`, (req, res) => {
      authorize(req, res)
      .then(session => {
        const Doc = mongoose.model(modelName);
        let data = req.body;
        data.created = new Date();
        data.modified = data.created;
        data.userId = session.userId;
        data = (transformIn.post ? transformIn.post(data, session) : data);
        const doc = new Doc(data);
        doc.save()
        .then(doc => (transformOut.post ? transformOut.post(doc, req) : doc))
        .then(doc => res.status(200).json(doc))
        .catch(error => res.status(400).json(error));
      });
    });
  }
};

// User

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
  .catch(error => res.status(400).json(error));
});

const VERIFY_INSTRUCTIONS = `
# Sign in

Click the link below to sign in. This link is valid for 2 hours.
`;

router.post('/users/verify-email', (req, res) => {
  let data = req.body;
  const User = mongoose.model('User');
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
      const url = `${req.protocol}://${req.get('Host')}` +
        `/verify-email?token=${user.temporaryToken}`;
      transporter.sendMail({
        from: 'ericsoderberg@coconut.local',
        to: user.email,
        subject: 'Verify Email',
        markdown: `${VERIFY_INSTRUCTIONS}\n\n[Sign In](${url})`
      }, (err, info) => {
        console.log('!!! sendMail', err, info);
      });
    });
  })
  .then(() => res.status(200).send({}))
  .catch(error => res.status(400).json(error));
});

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

register('users', 'User', {
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

// other

register('resources', 'Resource', {
  authorize: {
    index: authorizedAdministrator
  }
});

register('form-templates', 'FormTemplate', {
  authorize: {
    index: authorizedForDomain
  },
  transformIn: {
    put: unsetDomainIfNeeded
  }
});

register('forms', 'Form', {
  authorize: {
    index: authorizedForDomainOrSelf
  },
  omit: ['post'], // special handling for POST of form below
  populate: {
    index: [
      { path: 'userId', select: 'name' },
      { path: 'formTemplateId', select: 'name domainId' }
    ]
  },
  transformIn: {
    put: unsetDomainIfNeeded
  }
});

function formValueForFieldName (formTemplate, form, fieldName) {
  let result;
  formTemplate.sections.some(section => {
    return section.fields.some(field => {
      if (field.name && field.name.toLowerCase() === fieldName.toLowerCase()) {
        return form.fields.some(field2 => {
          if (field._id.equals(field2.fieldId)) {
            result = field2.value;
            return true;
          }
        });
      }
    });
  });
  return result;
}

const FORM_SIGN_IN_MESSAGE = '[Sign In](/sign-in) to be able to submit this form.';

router.post(`/forms`, (req, res) => {
  authorize(req, res, false)
  .then(session => {
    if (session) {
      return session;
    }
    console.log('!!! no session, load template');
    // we don't have a session, try to create one
    // get the form template so we can see what the field names are
    const FormTemplate = mongoose.model('FormTemplate');
    const data = req.body;
    return FormTemplate.findOne({ _id: data.formTemplateId }).exec()
    .then(formTemplate => {

      const email = formValueForFieldName(formTemplate, data, 'email');
      const name = formValueForFieldName(formTemplate, data, 'name');
      if (! email || ! name) {
        console.log('!!! No email or name');
        return Promise.reject({ error: FORM_SIGN_IN_MESSAGE});
      }

      // see if we have an account for this email already
      console.log('!!! have email, look for user', email);
      const User = mongoose.model('User');
      return User.findOne({ email: email }).exec()
      .then(user => {
        if (user) {
          console.log('!!! already have a user');
          return Promise.reject({ error: FORM_SIGN_IN_MESSAGE});
        }
        console.log('!!! no user, create one');

        // create a new user
        const now = new Date();
        user = new User({
          created: now,
          email: email,
          modified: now,
          name: name
        });
        return user.save();
      })
      .then(user => {
        // create a new session
        const Session = mongoose.model('Session');
        const session = new Session({
          email: user.email,
          name: user.name,
          token: hat(), // better to encrypt this before storing it, someday
          userId: user._id
        });
        return session.save();
      });
    });
  })
  .then(session => {
    const Form = mongoose.model('Form');
    let data = req.body;
    data.created = new Date();
    data.modified = data.created;
    data.userId = session.userId;
    const form = new Form(data);
    return form.save()
    .then(doc => {
      if (! session.loginAt) {
        // we created this session here, return it
        res.status(200).json(session);
      } else {
        res.status(200).send({});
      }
    });
  })
  .catch(error => {
    console.log('!!! post form catch', error);
    res.status(400).json(error);
  });
});

// Email lists

const populateEmailList = (emailList) => {
  const User = mongoose.model('User');

  let promises = [Promise.resolve(emailList)];
  emailList.addresses.forEach(address => {
    promises.push(User.findOne({ email: address.address }).select('name').exec());
  });

  return Promise.all(promises)
  .then(docs => {
    let emailListData = docs[0].toObject();
    emailListData.addresses.forEach((address, index) => {
      const user = docs[1 + index];
      address.userId = { _id: user._id, name: user.name };
    });
    emailListData.addresses.sort((a, b) => {
      const aa = a.address.toLowerCase();
      const ba = b.address.toLowerCase();
      return (aa < ba ? -1 : (aa > ba ? 1 : 0));
    });
    return emailListData;
  });
};

register('email-lists', 'EmailList', {
  authorize: {
    index: authorizedForDomain
  },
  transformIn: {
    put: unsetDomainIfNeeded
  },
  transformOut: {
    get: (emailList, req) => {
      if (emailList) {
        return populateEmailList(emailList);
      }
      return emailList;
    }
  }
});

router.post('/email-lists/:id/subscribe', (req, res) => {
  authorize(req, res)
  .then(session => {
    const id = req.params.id;
    const EmailList = mongoose.model('EmailList');
    return EmailList.findOne({ _id: id }).exec();
  })
  .then(doc => {
    // normalize addresses
    const addresses = req.body.map(a => (
      typeof a === 'string' ? { address: a } : a
    ));
    addresses.forEach(address => {
      if (! doc.addresses.some(a => a.address === address.address)) {
        doc.addresses.push(address);
      }
    });
    doc.modified = new Date();
    return doc.save();
  })
  .then(doc => res.status(200).send())
  // TODO: update mailman
  .catch(error => res.status(400).json(error));
});

router.post('/email-lists/:id/unsubscribe', (req, res) => {
  authorize(req, res)
  .then(session => {
    const id = req.params.id;
    const EmailList = mongoose.model('EmailList');
    return EmailList.findOne({ _id: id }).exec();
  })
  .then(doc => {
    // normalize addresses
    const addresses = req.body.map(a => (
      typeof a === 'string' ? { address: a } : a
    ));
    addresses.forEach(address => {
      doc.addresses = doc.addresses.filter(a => a.address !== address.address);
    });
    doc.modified = new Date();
    return doc.save();
  })
  .then(doc => res.status(200).send())
  .catch(error => res.status(400).json(error));
});

register('domains', 'Domain', {
  authorize: {
    index: authorizedAdministrator
  }
});

// Pages

function addParents (page, pages) {
  page.parents = [];
  Object.keys(pages).forEach(id => {
    const parent = pages[id];
    if (parent.children.some(childId => childId.equals(page._id))) {
      addParents(parent, pages);
      // don't care about children of parents
      parent.children = [];
      page.parents.push(parent);
    }
  });
}

function addChildren (page, pages) {
  page.children = page.children.map(childId => {
    let child = pages[childId];
    addChildren(child, pages);
    return child;
  });
}

router.get('/pages/:id/map', (req, res) => {
  authorize(req, res)
  .then(session => {
    const Page = mongoose.model('Page');
    return Page.find({})
    .select('name sections')
    .populate({ path: 'sections.pages.id', select: 'name path' })
    .exec();
  })
  .then(docs => {
    // generate an object keyed by page id and containing page references
    const pages = {};
    docs.forEach(doc => {
      let children = [];
      doc.sections.filter(s => 'pages' === s.type)
      .forEach(s => s.pages.forEach(p => children.push(p.id._id)));
      let page = { _id: doc._id, children: children, name: doc.name };
      pages[doc._id] = page;
    });
    return pages;
  })
  .then(pages => {
    const id = req.params.id;
    let map = pages[id];
    addParents(map, pages);
    addChildren(map, pages);
    return map;
  })
  .then(map => res.status(200).json(map))
  .catch(error => res.status(400).json(error));
});

const PAGE_MESSAGE_FIELDS = 'path name verses author date image series seriesId';

const populatePage = (page) => {
  const Message = mongoose.model('Message');
  let date = moment().subtract(1, 'day');

  let promises = [Promise.resolve(page)];

  // Library
  page.sections.filter(section => 'library' === section.type)
  .forEach(section => {
    promises.push(
      Message.findOne({
        library: section.name,
        date: { $gt: date.toString() },
        series: { $ne: true }
      })
      .sort('date').select(PAGE_MESSAGE_FIELDS).exec()
      .then(message => {
        if (message && message.seriesId) {
          // get series instead
          return (
            Message.findOne({ _id: message.seriesId })
            .select(PAGE_MESSAGE_FIELDS).exec()
          );
        } else {
          return message;
        }
      })
    );
  });

  return Promise.all(promises)
  .then(docs => {
    let pageData = docs[0].toObject();
    pageData.sections.filter(section => 'library' === section.type)
    .forEach((section, index) => {
      section.message = docs[1 + index];
    });
    return pageData;
  });
};

register('pages', 'Page', {
  authorize: {
    index: authorizedForDomain
  },
  populate: {
    get: [
      { path: 'sections.pages.id', select: 'name path' },
      {
        path: 'sections.eventId',
        select: 'name path start end dates times address location'
      },
      { path: 'sections.formTemplateId', select: 'name' }
    ]
  },
  transformIn: {
    put: unsetDomainIfNeeded
  },
  transformOut: {
    get: (page, req) => {
      if (page && req.query.populate) {
        return populatePage(page);
      }
      return page;
    }
  }
});

// Messages

const populateMessage = (message) => {
  const Doc = mongoose.model('Message');
  const subFields = 'name verses date path';

  // nextMessage
  const nextPromise = Doc.find({
    library: message.library,
    date: { $gt: message.date },
    series: { $ne: true }
  })
  .sort('date').limit(1).select(subFields).exec();

  // previousMessage
  const previousPromise = Doc.find({
    library: message.library,
    date: { $lt: message.date },
    series: { $ne: true }
  })
  .sort('-date').limit(1).select(subFields).exec();

  // seriesMessages
  const seriesMessagesPromise = Doc.find({ seriesId: message.id })
  .select(subFields).exec();

  return Promise.all([Promise.resolve(message), nextPromise,
    previousPromise, seriesMessagesPromise])
  .then(docs => {
    let messageData = docs[0].toObject();
    messageData.nextMessage = docs[1][0];
    messageData.previousMessage = docs[2][0];
    messageData.seriesMessages = docs[3];
    return messageData;
  });
};

register('messages', 'Message', {
  populate: {
    get: { path: 'seriesId', select: 'name path' }
  },
  transformIn: {
    put: unsetDomainIfNeeded
  },
  transformOut: {
    get: (message, req) => {
      if (message && req.query.populate) {
        return populateMessage(message);
      }
      return message;
    }
  },
  searchProperties: ['name', 'author', 'verses']
});

// Newsletter

router.post('/newsletters/render', (req, res) => {
  const Newsletter = mongoose.model('Newsletter');
  const newsletter = new Newsletter(req.body);
  const Message = mongoose.model('Message');
  const Event = mongoose.model('Event');
  const messageFields = 'name verses date path author';

  // nextMessage
  let nextPromise;
  if (newsletter.date && newsletter.library) {
    nextPromise = Message.find({
      library: newsletter.library,
      date: { $gt: newsletter.date },
      series: { $ne: true }
    })
    .sort('date').limit(1).select(messageFields).exec();
  } else {
    nextPromise = Promise.resolve([]);
  }

  // previousMessage
  let previousPromise;
  if (newsletter.date && newsletter.library) {
    previousPromise = Message.find({
      library: newsletter.library,
      date: { $lt: newsletter.date },
      series: { $ne: true }
    })
    .sort('-date').limit(1).select(messageFields).exec();
  } else {
    previousPromise = Promise.resolve([]);
  }

  // events
  let eventsPromise;
  if (newsletter.date && newsletter.calendar) {
    const date = moment(newsletter.date);
    eventsPromise = Event.find({
      calendar: newsletter.calendar,
      start: {
        $gt: date.toDate(),
        $lt: moment(date).add(2, 'months').toDate()
      }
    }).exec();
  } else {
    eventsPromise = Promise.resolve([]);
  }

  Promise.all([Promise.resolve(newsletter), nextPromise,
    previousPromise, eventsPromise])
  .then(docs => {
    let newsletterData = docs[0].toObject();
    newsletterData.nextMessage = docs[1][0];
    newsletterData.previousMessage = docs[2][0];
    newsletterData.events = docs[3];
    res.send(renderNewsletter(newsletterData));
  })
  .catch(error => res.status(400).json(error));
});

register('newsletters', 'Newsletter', {
  authorize: {
    index: authorizedForDomain
  },
  transformIn: {
    put: unsetDomainIfNeeded
  }
});

// Site

router.get('/site', (req, res) => {
  const Doc = mongoose.model('Site');
  Doc.findOne({})
  .populate({ path: 'homePageId', select: 'name' })
  .exec()
  .then(doc => res.json(doc))
  .catch(error => res.status(400).json(error));
});

router.post('/site', (req, res) => {
  authorize(req, res)
  .then(session => {
    const Doc = mongoose.model('Site');
    let data = req.body;
    data.modified = new Date();
    data.userId = session.userId;
    const doc = new Doc(data);
    return Doc.remove({}).exec()
    .then(() => doc.save());
  })
  .then(doc => res.status(200).json(doc))
  .catch(error => res.status(400).json(error));
});

// Calendar

router.get('/calendar', (req, res) => {
  const date = moment(req.query.date || undefined);
  const start = moment(date).startOf('month').startOf('week');
  const end = moment(date).endOf('month').endOf('week');
  const previous = moment(date).subtract(1, 'month');
  const next = moment(date).add(1, 'month');
  // find all events withing the time window
  const Event = mongoose.model('Event');
  let q = {
    end: { $gte: start.toDate() },
    start: { $lt: end.toDate() }
  };
  if (req.query.search) {
    const exp = new RegExp(req.query.search, 'i');
    q.name = exp;
  }
  if (req.query.filter) {
    q = { ...q, ...JSON.parse(req.query.filter) };
  }
  Event.find(q)
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
  .catch(error => res.status(400).json(error));
});

// Events

// Supporting functions for /events/resources

function eventMoments (event) {
  let result = [{
    start: moment(event.start),
    end: moment(event.end)
  }];
  if (event.times) {
    result.concat(event.times.map(time => ({
      start: moment(time.start),
      end: moment(time.end)
    })));
  }
  if (event.dates) {
    let recurrence = [];
    event.dates.forEach(date => {
      result.forEach(time => {
        recurrence.push({
          start: moment(date).set({
            hour: time.start.hour(),
            minute: time.start.minute()
          }),
          end: moment(date).set({
            hour: time.end.hour(),
            minute: time.end.minute()
          })
        });
      });
    });
    result = result.concat(recurrence);
  }
  return result;
}

function overlapsMoments (event, moments) {
  const moments2 = eventMoments(event);
  return moments.some(moment => {
    return moments2.some(moment2 => {
      return (moment.end.isAfter(moment2.start) &&
        moment.start.isBefore(moment2.end));
    });
  });
}

function overlappingEvents (event) {
  const Event = mongoose.model('Event');
  const moments = eventMoments(event);
  return Event.find({ _id: { $ne: event._id } }).exec()
  .then(events => events.filter(event2 => overlapsMoments(event2, moments)));
}

function resourceIdsWithEvents (events) {
  let resourceIdsEvents = {}; // _id => [{ _id: <event id>, name: <event name }]
  events.forEach(event2 => {
    if (event2.resourceIds) {
      event2.resourceIds.forEach(resourceId => {
        const stringId = resourceId.toString();
        if (! resourceIdsEvents[stringId]) {
          resourceIdsEvents[stringId] = [];
        }
        resourceIdsEvents[stringId].push({ _id: event2._id, name: event2.name });
      });
    }
  });
  return resourceIdsEvents;
}

function resourcesWithEvents (resourceIdsEvents) {
  const Resource = mongoose.model('Resource');
  return Resource.find({}).sort('name').exec()
  .then(resources => {
    // Decorate with the overlapping events used by the resources.
    return resources.map(resource => {
      // Annotated with events already using them
      let object = resource.toObject();
      object.events = resourceIdsEvents[object._id.toString()];
      return object;
    });
  });
}

router.post('/events/resources', (req, res) => {
  authorize(req, res)
  // Get all events that overlap this event.
  .then(session => {
    const Event = mongoose.model('Event');
    const event = new Event(req.body);
    return overlappingEvents(event);
  })
  // Collect the resourceIds they use.
  .then(resourceIdsWithEvents)
  // Get all resources and annotate with events.
  .then(resourcesWithEvents)
  .then(resources => res.status(200).json(resources))
  .catch(error => res.status(400).json(error));
});

// Supporting functions for /events/unavailable-dates

function timeInHours (time) {
  const start = moment(time.start);
  const end = moment(time.end);
  return {
    start: start.hour() + (start.minute() / 60.0),
    end: end.hour() + (end.minute() / 60.0)
  };
}

function eventInHours (event) {
  let hours = [timeInHours(event)];
  if (event.times) {
    hours = hours.concat(event.times.map(timeInHours));
  }
  return hours;
}

function hoursOverlap (event2, hours) {
  const hours2 = eventInHours(event2);
  return hours.some(hour => (
    hours2.some(hour2 => (hour2.end > hour.start && hour2.start < hour.end))
  ));
}

function resourcesOverlap (event2, resourceIds) {
  return resourceIds.some(resourceId => (
    event2.resourceIds.some(resourceId2 => resourceId.equals(resourceId2))
  ));
}

function eventDates (event) {
  let dates = [event.start];
  return dates.concat(event.dates || []);
}

router.post('/events/unavailable-dates', (req, res) => {
  authorize(req, res)
  .then(session => {
    const Event = mongoose.model('Event');
    const event = new Event(req.body);

    const hours = eventInHours(event);
    const resourceIds = event.resourceIds;

    // Find all events using the resources this event is using at the same
    // times of day.
    return Event.find({ _id: { $ne: event._id } }).exec()
    .then(events => {
      // events using a same resource
      return events.filter(event2 => resourcesOverlap(event2, resourceIds))
      // events at the same time of day
      .filter(event2 => hoursOverlap(event2, hours))
      .map(eventDates);
    });
  })
  .then(unavailableDatess => {
    let unavailableDates = [];
    unavailableDatess.forEach(dates => {
      unavailableDates = unavailableDates.concat(dates);
    });
    return unavailableDates;
  })
  .then(unavailableDates => res.status(200).json(unavailableDates))
  .catch(error => res.status(400).json(error));
});

register('events', 'Event', {
  populate: {
    get: { path: 'primaryEventId', select: 'name path' }
  },
  transformIn: {
    put: unsetDomainIfNeeded
  }
});

// Files

router.get('/files/:id/:name', (req, res) => {
  const { id, name } = req.params;
  res.download(`${FILES_PATH}/${id}/${name}`);
});

router.get('/files/:id', (req, res) => {
  const id = req.params.id;
  fs.readdir(`${FILES_PATH}/${id}`, (error, files) => {
    if (error) {
      res.status(400).json(error);
    } else {
      res.download(`${FILES_PATH}/${id}/${files[0]}`);
    }
  });
});

router.delete('/files/:id', (req, res) => {
  authorize(req, res)
  .then(session => {
    const id = req.params.id;
    rmdir(`${FILES_PATH}/${id}`, (error) => {
      if (error) {
        res.status(400).json(error);
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
        res.status(400).json(error);
      } else {
        let start = 0;
        if (req.query.skip) {
          start = parseInt(req.query.skip, 10);
        }
        files = files.slice(start, start + 20);
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
    let fstream;
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      const dir = `${FILES_PATH}/${id}`;
      fs.mkdir(dir, () => {
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

// Search

router.get('/search', (req, res) => {
  const Page = mongoose.model('Page');
  const exp = new RegExp(req.query.search, 'ig');
  const q = { $or: [ { name: exp }, { 'sections.text': exp } ] };
  Page.find(q)
  .select('name sections')
  .limit(20)
  .exec()
  .then(docs => {
    // prune sections down to just text
    docs.forEach(doc => {
      doc.sections = doc.sections.filter(section => {
        if ('text' === section.type && exp.test(section.text)) {
          section.text =
            section.text.replace(exp, `**${req.query.search}**`);
          return true;
        }
        return false;
      });
    });
    res.status(200).json(docs);
  })
  .catch(error => res.status(400).json(error));
});

module.exports = router;
