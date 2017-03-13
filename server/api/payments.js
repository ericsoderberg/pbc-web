import mongoose from 'mongoose';
import register from './register';
import { authorize, authorizedForDomainOrSelf } from './auth';
import { unsetDomainIfNeeded } from './domains';

mongoose.Promise = global.Promise;

// /api/payments

export default function (router) {
  register(router, {
    category: 'payments',
    modelName: 'Payment',
    omit: ['post', 'put'], // special handling for POST and PUT of form below
    index: {
      authorize: authorizedForDomainOrSelf,
      populate: [
        { path: 'userId', select: 'name' },
      ],
    },
    get: {
      populate: [
        { path: 'userId', select: 'name' },
      ],
    },
    put: {
      transformIn: unsetDomainIfNeeded,
    },
  });

  router.post('/payments', (req, res) => {
    authorize(req, res)
    .then((session) => {
      const FormTemplate = mongoose.model('FormTemplate');
      const data = req.body;
      return FormTemplate.findOne({ _id: data.formTemplateId }).exec()
      .then(formTemplate => ({ formTemplate, session }));
    })
    .then((context) => {
      const { formTemplate, session } = context;
      const Payment = mongoose.model('Payment');
      const data = req.body;
      data.created = new Date();
      data.modified = data.created;
      if (!data.sent) {
        data.sent = data.created;
      }
      // Allow an administrator to set the userId. Otherwise, set it to
      // the current session user
      if (!data.userId ||
        !(session.userId.administrator || (formTemplate.domainId &&
          formTemplate.domainId.equals(session.userId.administratorDomainId)))) {
        data.userId = session.userId;
      }
      const payment = new Payment(data);
      return payment.save();
    })
    .then((doc) => {
      // update forms to record payment
      const Form = mongoose.model('Form');
      const promises = [];
      req.body.formIds.forEach((formId) => {
        promises.push(Form.findOne({ _id: formId }).exec()
        .then((form) => {
          form.paymentIds.push(doc._id);
          return form.save();
        }));
      });
      return Promise.all(promises);
    })
    .then(doc => res.status(200).send(doc))
    .catch((error) => {
      console.error('!!! post payment catch', error);
      res.status(400).json(error);
    });
  });

  router.put('/payments/:id', (req, res) => {
    authorize(req, res)
    .then((session) => {
      const id = req.params.id;
      const Payment = mongoose.model('Payment');
      return Payment.findOne({ _id: id }).exec()
      .then((payment) => {
        let data = req.body;
        // Allow an administrator to set the userId. Otherwise, set it to
        // the current session user
        if (!data.userId ||
          !(session.userId.administrator || (payment.domainId &&
            payment.domainId.equals(session.userId.administratorDomainId)))) {
          data.userId = session.userId;
        }
        data.modified = new Date();
        data = unsetDomainIfNeeded(data, session);
        return payment.update(data);
      });
    })
    .then(doc => res.status(200).json(doc))
    .catch((error) => {
      console.error('!!! post payment catch', error);
      res.status(400).json(error);
    });
  });
}
