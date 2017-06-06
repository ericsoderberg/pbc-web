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

const updateForms = (payment, formIds) => {
  // update forms to record payment
  const Form = mongoose.model('Form');
  const promises = [];
  (formIds || []).forEach((formId) => {
    promises.push(Form.findOne({ _id: formId }).exec()
    .then((form) => {
      form.paymentIds.push(payment._id);
      return form.save();
    }));
  });
  return Promise.all(promises);
};

const deletePaymentRelated = (doc) => {
  const Form = mongoose.model('Form');
  Form.update(
    { paymentIds: doc._id },
    { $pull: { formIds: doc._id } },
  ).exec()
  .then(() => doc);
};

const canAdmin = (session, payment = {}) => (
  session.userId.administrator || (payment.domainId &&
    payment.domainId.equals(session.userId.administratorDomainId))
);

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
    .then(context => res.status(200).json(context.payment))
    .catch(error => catcher(error, res));
  });

  router.post('/payments', (req, res) => {
    getSession(req)
    .then(requireSession)
    .then(session => getPostData(req).then(data => ({ session, data })))
    // .then((context) => {
    //   const { data } = context;
    //   const FormTemplate = mongoose.model('FormTemplate');
    //   return FormTemplate.findOne({ _id: data.formTemplateId }).exec()
    //   .then(formTemplate => ({ formTemplate, ...context }));
    // })
    .then((context) => {
      const { data, session } = context;
      if (canAdmin(session) && data.userId) {
        const User = mongoose.model('User');
        return User.findOne({ _id: data.userId }).exec()
        .then(user => ({ user, ...context }));
      }
      return context;
    })
    .then((context) => {
      const { data, session, user } = context;
      const Payment = mongoose.model('Payment');
      data.created = new Date();
      data.modified = data.created;
      if (!data.sent) {
        data.sent = data.created;
      }
      // Allow an administrator to set the userId. Otherwise, set it to
      // the current session user
      if (!data.userId || !canAdmin(session)) {
        data.userId = session.userId;
      }
      const useUser = user || session.userId;
      data.name = useUser.name || useUser.email;
      const payment = new Payment(data);
      return payment.save().then(doc => ({ doc, ...context }));
    })
    .then(context => updateForms(context.doc, context.data.formIds)
      .then(() => context.doc))
    .then(doc => res.status(200).send(doc))
    .catch(error => catcher(error, res));
  });

  router.put('/payments/:id', (req, res) => {
    const Payment = mongoose.model('Payment');
    getSession(req)
    .then(requireSession)
    .then(session => getPostData(req).then(data => ({ session, data })))
    // get prior payment
    .then((context) => {
      const id = req.params.id;
      return Payment.findOne({ _id: id }).exec()
      .then(payment => ({ payment, ...context }));
    })
    // authorize
    .then((context) => {
      const { payment } = context;
      return requireDomainAdministratorOrUser(
        context, payment.domainId, payment.userId);
    })
    .then((context) => {
      const { data, payment, session } = context;
      if (canAdmin(session, payment) && data.userId) {
        const User = mongoose.model('User');
        return User.findOne({ _id: data.userId }).exec()
        .then(user => ({ user, ...context }));
      }
      return context;
    })
    .then((context) => {
      const { data, session, payment, user } = context;
      // Allow an administrator to set the userId. Otherwise, set it to
      // the current session user
      if (!data.userId || !canAdmin(session, payment)) {
        data.userId = session.userId;
      }
      const useUser = user || session.userId;
      data.name = useUser.name || useUser.email;
      data.modified = new Date();
      // Have to use update in case non-admin edits something, don't want
      // to overwrite admin fields.
      return payment.update(unsetDomainIfNeeded(data, session))
      .then(() => Payment.findOne({ _id: req.params.id })
        .exec()
        .then(doc => ({ doc, data })));
    })
    .then(context => updateForms(context.doc, context.data.formIds)
      .then(() => context.doc))
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
