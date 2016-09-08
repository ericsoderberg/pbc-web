"use strict";
import mongoose from 'mongoose';
import { unsetDomainIfNeeded } from './auth';
import register from './register';

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

export default function (router) {
  register(router, 'messages', 'Message', {
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
}
