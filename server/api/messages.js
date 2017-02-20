"use strict";
import mongoose from 'mongoose';
import { unsetDomainIfNeeded } from './domains';
import { unsetLibraryIfNeeded } from './libraries';
import register from './register';

// Messages

const populateMessage = (message) => {
  const Doc = mongoose.model('Message');
  const subFields = 'name verses date path author';

  // nextMessage
  const nextPromise = Doc.find({
    libraryId: message.libraryId,
    date: { $gt: message.date },
    series: { $ne: true }
  })
  .sort('date').limit(1).select(subFields).exec();

  // previousMessage
  const previousPromise = Doc.find({
    libraryId: message.libraryId,
    date: { $lt: message.date },
    series: { $ne: true }
  })
  .sort('-date').limit(1).select(subFields).exec();

  // seriesMessages
  const seriesMessagesPromise = Doc.find({ seriesId: message.id })
  .sort('date').select(subFields).exec();

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

const unsetReferences = (data) => {
  data = unsetLibraryIfNeeded(data);
  data = unsetDomainIfNeeded(data);
  return data;
};

export default function (router) {
  register(router, {
    category: 'messages',
    modelName: 'Message',
    omit: ['index'],
    // index: {
    //   textSearch: true
    // },
    get: {
      populate: [
        { path: 'seriesId', select: 'name path' },
        { path: 'libraryId', select: 'name path' }
      ],
      transformOut: (message, req) => {
        if (message && req.query.populate) {
          return populateMessage(message);
        }
        return message;
      }
    },
    put: {
      transformIn: unsetReferences
    }
  });

  // custom one below because register version wasn't working with $text
  router.get(`/messages`, (req, res) => {
    const Message = mongoose.model('Message');

    let criteria = {};
    let options = {};
    let sort = req.query.sort;

    if (req.query.filter) {
      let filter = JSON.parse(req.query.filter);
      if (typeof filter === 'string') {
        // need double de-escape,
        // first to de-string and then to de-stringify
        filter = JSON.parse(filter);
      }
      criteria = { ...criteria, ...filter };
    }

    if (req.query.search) {
      criteria = { ...criteria, $text: { $search: req.query.search } };
      options = { ...options, score : { $meta: "textScore" } };
      sort = { score: { $meta: "textScore" }, date: -1 };
    }

    let query = Message.find(criteria, options);

    query.sort(sort);

    if (req.query.select) {
      query.select(req.query.select);
    }

    if (req.query.populate) {
      const populate = JSON.parse(req.query.populate);
      addPopulate(query, populate);
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
    .then(docs => res.json(docs))
    .catch(error => res.status(400).json(error));
  });
}
