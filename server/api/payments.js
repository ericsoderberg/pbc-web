import mongoose from 'mongoose';
import register from './register';
import {
  getSession, authorizedForDomainOrSelf, requireSession,
  requireDomainAdministratorOrUser,
} from './auth';
import { unsetDomainIfNeeded } from './domains';
import { catcher, getPostData } from './utils';

mongoose.Promise = global.Promise;

// /api/payments

const deletePaymentRelated = (doc) => {
  const Form = mongoose.model('Form');
  Form.update(
    { paymentIds: doc._id },
    { $pull: { formIds: doc._id } },
  ).exec()
  .then(() => doc);
};

export default function (router) {
  register(router, {
    category: 'payments',
    modelName: 'Payment',
    omit: ['get', 'post', 'put', 'delete'], // special handling below
    index: {
      filterAuthorized: authorizedForDomainOrSelf,
      populate: [
        { path: 'userId', select: 'name' },
      ],
    },
  });

  router.get('/payments/:id', (req, res) => {
    getSession(req)
    .then(requireSession)
    // get payment
    .then((session) => {
      const id = req.params.id;
      const Payment = mongoose.model('Payment');
      return Payment.findOne({ _id: id })
      .populate({ path: 'userId', select: 'name' })
      .exec()
      .then(payment => ({ payment, session }));
    })
    // authorize
    .then((context) => {
      const { payment } = context;
      return requireDomainAdministratorOrUser(
        context, payment.domainId, payment.userId);
    })
    .then(doc => res.status(200).json(doc))
    .catch(error => catcher(error, res));
  });

  router.post('/payments', (req, res) => {
    getSession(req)
    .then(requireSession)
    .then(session => getPostData(req).then(data => ({ session, data })))
    .then((context) => {
      const { data } = context;
      const FormTemplate = mongoose.model('FormTemplate');
      return FormTemplate.findOne({ _id: data.formTemplateId }).exec()
      .then(formTemplate => ({ formTemplate, ...context }));
    })
    .then((context) => {
      const { data, formTemplate, session } = context;
      const Payment = mongoose.model('Payment');
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
      return payment.save().then(doc => ({ doc, ...context }));
    })
    .then((context) => {
      const { data, doc } = context;
      // update forms to record payment
      const Form = mongoose.model('Form');
      const formIds = data.formIds;
      const promises = [];
      formIds.forEach((formId) => {
        promises.push(Form.findOne({ _id: formId }).exec()
        .then((form) => {
          form.paymentIds.push(doc._id);
          return form.save();
        }));
      });
      return Promise.all(promises).then(() => doc);
    })
    .then(doc => res.status(200).send(doc))
    .catch(error => catcher(error, res));
  });

  router.put('/payments/:id', (req, res) => {
    getSession(req)
    .then(requireSession)
    // get prior payment
    .then((session) => {
      const id = req.params.id;
      const Payment = mongoose.model('Payment');
      return Payment.findOne({ _id: id }).exec()
      .then(payment => ({ payment, session }));
    })
    // authorize
    .then((context) => {
      const { payment } = context;
      return requireDomainAdministratorOrUser(
        context, payment.domainId, payment.userId);
    })
    .then((context) => {
      const { session, payment } = context;
      let data = unsetDomainIfNeeded(req.body);
      // Allow an administrator to set the userId. Otherwise, set it to
      // the current session user
      if (!data.userId ||
        !(session.userId.administrator ||
          (session.userId.administratorDomainId &&
          session.userId.administratorDomainId.equals(payment.domainId)))) {
        data.userId = session.userId;
      }
      data.modified = new Date();
      data = unsetDomainIfNeeded(data, session);
      return payment.update(data);
    })
    .then(doc => res.status(200).json(doc))
    .catch(error => catcher(error, res));
  });

  router.delete('/payments/:id', (req, res) => {
    getSession(req)
    .then(requireSession)
    // get prior payment
    .then((session) => {
      const id = req.params.id;
      const Payment = mongoose.model('Payment');
      return Payment.findOne({ _id: id }).exec()
      .then(payment => ({ payment, session }));
    })
    // authorize
    .then((context) => {
      const { payment } = context;
      return requireDomainAdministratorOrUser(
        context, payment.domainId, payment.userId);
    })
    // remove payment
    .then(context => context.payment.remove())
    .then(deletePaymentRelated)
    // respond
    .then(() => res.status(200).send())
    .catch(error => catcher(error, res));
  });
}
