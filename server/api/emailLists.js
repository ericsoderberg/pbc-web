"use strict";
import mongoose from 'mongoose';
import { authorize, authorizedForDomain } from './auth';
import { unsetDomainIfNeeded } from './domains';
import register from './register';

// /api/email-lists

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

export default function (router) {
  register(router, 'email-lists', 'EmailList', {
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
}
