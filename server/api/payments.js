"use strict";
import mongoose from 'mongoose';
import register from './register';
import { authorize, authorizedForDomainOrSelf } from './auth';
import { unsetDomainIfNeeded } from './domains';

// /api/payments

export default function (router) {

  register(router, {
    category: 'payments',
    modelName: 'Payment',
    omit: ['post', 'put'], // special handling for POST and PUT of form below
    index: {
      authorize: authorizedForDomainOrSelf,
      populate: [
        { path: 'userId', select: 'name' }
      ]
    },
    get: {
      populate: [
        { path: 'userId', select: 'name' }
      ]
    },
    put: {
      transformIn: unsetDomainIfNeeded
    }
  });

  router.post(`/payments`, (req, res) => {
    authorize(req, res)
    .then(session => {
      const Payment = mongoose.model('Payment');
      let data = req.body;
      data.created = new Date();
      data.modified = data.created;
      if (! data.sent) {
        data.sent = data.created;
      }
      // Allow an administrator to set the userId. Otherwise, set it to
      // the current session user
      if (! data.userId ||
        ! (session.administrator || (formTemplate.domainId &&
          formTemplate.domainId.equals(session.administratorDomainId)))) {
        data.userId = session.userId;
      }
      const payment = new Payment(data);
      return payment.save()
      .then(doc => res.status(200).send(doc));
    })
    .catch(error => {
      console.log('!!! post payment catch', error);
      res.status(400).json(error);
    });
  });

  router.put(`/payments/:id`, (req, res) => {
    authorize(req, res)
    .then(session => {
      const id = req.params.id;
      const Payment = mongoose.model('Payment');
      return Payment.findOne({ _id: id }).exec()
      .then(payment => {
        let data = req.body;
        // Allow an administrator to set the userId. Otherwise, set it to
        // the current session user
        if (! data.userId ||
          ! (session.administrator || (formTemplate.domainId &&
            formTemplate.domainId.equals(session.administratorDomainId)))) {
          data.userId = session.userId;
        }
        data.modified = new Date();
        data = unsetDomainIfNeeded(data, session);
        return payment.update(data);
      });
    })
    .then(doc => res.status(200).json(doc))
    .catch(error => {
      console.log('!!! post payment catch', error);
      res.status(400).json(error);
    });
  });
}
