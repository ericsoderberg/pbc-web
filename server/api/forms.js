import mongoose from 'mongoose';
import {
  getSession, authorizedForDomainOrSelf, requireSession,
  requireDomainAdministratorOrUser,
} from './auth';
import { findOrCreateUser } from './users';
import { createUserAndSession } from './sessions';
import { unsetDomainIfNeeded } from './domains';
import { renderNotification } from './email';
import { subscribe, unsubscribe } from './emailLists';
// import { initializePayments } from './formTemplates';
import register from './register';
import { catcher } from './utils';

mongoose.Promise = global.Promise;

const SUBMIT_GERUND = {
  Register: 'registering',
  'Sign Up': 'signing up',
  Submit: 'submitting',
  Subscribe: 'subscribing',
};

const UPDATE_GERUND = {
  Register: 'updating your registration',
  'Sign Up': 'updating',
  Submit: 'updating your submittal',
  Subscribe: 'updating your subscription',
};

const SUBMIT_PAST = {
  Register: 'registered',
  'Sign Up': 'signed up',
  Submit: 'submitted',
  Subscribe: 'subscribed',
};

const UPDATE_PAST = {
  Register: 'updated their registration',
  'Sign Up': 'updated',
  Submit: 'updated their submittal',
  Subscribe: 'updated their subscription',
};

// /api/forms

// const FORM_SIGN_IN_MESSAGE =
//   '[Sign In](/sign-in) to be able to submit this form.';

function pullUserData(formTemplate, form) {
  const result = {};
  formTemplate.sections.forEach(section => (
    section.fields.filter(templateField => templateField.linkToUserProperty)
      .forEach((templateField) => {
        form.fields.some((field) => {
          if (templateField._id.equals(field.templateFieldId)) {
            result[templateField.linkToUserProperty] = field.value;
            return true;
          }
          return false;
        });
      })
  ));
  return result;
}

const sendEmails = (req, transporter, update = false) => (
  context => (
    Promise.resolve(context)
      .then((emailContext) => {
        const Site = mongoose.model('Site');
        return Site.findOne({}).exec()
          .then(site => ({ ...emailContext, site }));
      })
      .then((emailContext) => {
        // send acknowledgement, if needed
        const { session, formTemplate, form, site } = emailContext;
        if (formTemplate.acknowledge) {
          const title = formTemplate.name;
          let message = formTemplate.acknowledgeMessage;
          if (!message) {
            let gerund;
            if (update) {
              gerund = UPDATE_GERUND[formTemplate.submitLabel] || UPDATE_GERUND.Submit;
            } else {
              gerund = SUBMIT_GERUND[formTemplate.submitLabel] || SUBMIT_GERUND.Submit;
            }
            let suffix = '';
            if (formTemplate.anotherLabel && form.name) {
              suffix = `${update ? ' for' : ''} ${form.name}`;
            }
            message = `Thank you for ${gerund}${suffix}.`;
          }
          const url = `${req.headers.origin}/forms/${form._id}/edit`;
          const contents = renderNotification(title, message, 'Review', url);

          transporter.sendMail({
            from: site.email,
            to: session.userId.email,
            subject: title,
            ...contents,
          }, (err, info) => {
            if (err) {
              console.error('!!! sendMail', err, info);
            }
          });
        }
        return emailContext;
      })
      .then((emailContext) => {
        // send notification, if needed
        const { session, formTemplate, form, site } = emailContext;
        if (formTemplate.notify) {
          const title = formTemplate.name;
          let past;
          if (update) {
            past = UPDATE_PAST[formTemplate.submitLabel] || UPDATE_PAST.Submit;
          } else {
            past = SUBMIT_PAST[formTemplate.submitLabel] || SUBMIT_PAST.Submit;
          }
          let suffix = '';
          if (formTemplate.anotherLabel && form.name) {
            suffix = `${update ? ' for' : ''} ${form.name}`;
          }
          const message =
  `${session.userId.name} (${session.userId.email}) ${past}${suffix}.`;
          const url = `${req.headers.origin}/forms/${form._id}/edit`;
          const contents = renderNotification(title, message, 'Review', url);
          transporter.sendMail({
            from: site.email,
            to: formTemplate.notify,
            subject: `${formTemplate.name} submittal`,
            ...contents,
          }, (err, info) => {
            if (err) {
              console.error('!!! sendMail', err, info);
            }
          });
        }
        return context;
      })
  )
);

export const addFormCost = (data, formTemplate, payments = {}) => {
  const form = data; // data.toObject ? data.toObject() : data;
  let total = 0;
  formTemplate.sections.forEach((section) => {
    section.fields.forEach((templateField) => {
      if (templateField.monetary) {
        // see if we have it
        form.fields.some((field) => {
          if (templateField._id.equals(field.templateFieldId)) {
            if (templateField.type === 'count' || templateField.type === 'number') {
              total += (parseInt(templateField.value, 10) *
                parseInt(field.value, 10)) || 0;
            } else if (templateField.type === 'line') {
              if (templateField.discount) {
                total -= parseInt(field.value, 10) || 0;
              } else {
                total += parseInt(field.value, 10) || 0;
              }
            } else if (templateField.type === 'choice') {
              templateField.options.forEach((templateOption) => {
                if (templateOption.value && field.optionId &&
                  templateOption._id.equals(field.optionId)) {
                  // old forms might have been migrated poorly, allow for name
                  total += parseInt(templateOption.value, 10) ||
                    parseInt(templateOption.name, 10) || 0;
                }
              });
            } else if (templateField.type === 'choices') {
              const optionIds = field.optionIds || [];
              templateField.options.forEach((templateOption) => {
                if (templateOption.value &&
                  optionIds.some(optionId => templateOption._id.equals(optionId))) {
                  // old forms might have been migrated poorly, allow for name
                  total += parseInt(templateOption.value, 10) ||
                    parseInt(templateOption.name, 10) || 0;
                }
              });
            }
            return true;
          }
          return false;
        });
      }
    });
  });

  let paid = 0;
  let received = 0;
  (form.paymentIds || []).forEach((payment) => {
    let amount;
    let receivedDate;
    const payment2 = payments[payment._id]; // consolidated, so we can track allocated
    if (payment2) {
      amount = Math.min(payment2.amount - payment2.allocated, total);
      payment2.allocated += amount;
      receivedDate = payment2.received;
    } else {
      amount = payment.amount;
      receivedDate = payment.received;
    }
    paid += amount;
    if (receivedDate) {
      received += amount;
    }
  });

  total = Math.max(0, total);
  const balance = total - paid;
  const unreceived = total - received;
  form.cost = { balance, paid, received, total, unreceived };

  return form;
};

export const updateFormCosts = (query) => {
  const payments = {};
  const Form = mongoose.model('Form');
  return Form.find(query)
    .populate({ path: 'formTemplateId ' })
    .populate({ path: 'paymentIds', select: 'amount received' })
    .exec()
    .then((forms) => {
      const promises = [];
      forms
        .filter(form => (
          form.formTemplateId && form.formTemplateId.payable && form.userId
        ))
        .forEach((form) => {
          form.paymentIds.forEach((payment) => {
            if (!payments[payment._id]) {
              payment.allocated = 0;
              payments[payment._id] = payment;
            }
          });
          form = addFormCost(form, form.formTemplateId, payments);
          // console.log('!!!', form._id, form.cost);
          promises.push(form.save());
        });
      return Promise.all(promises);
    });
};

const addFullness = context =>
  Promise.resolve()
    .then(() => {
      const { form } = context;
      if (form.linkedFormId) {
        const Form = mongoose.model('Form');
        return Form.findOne({ _id: form.linkedFormId })
          .populate({ path: 'formTemplateId', select: 'name domainId' })
          .exec()
          .then((linkedForm) => {
            form.linkedForm = linkedForm;
            return form;
          });
      }
      return form;
    });

const getFormContext = (session, id, populate = []) => {
  // Get current form
  const Form = mongoose.model('Form');
  const query = Form.findOne({ _id: id });
  populate.forEach(pop => query.populate(pop));
  return query.exec()
    .then(form => ({ session, form }))
    // Get corresponding form template
    .then((context) => {
      const { form } = context;
      // Get the FormTemplate so we can check the domainId for authorization.
      const FormTemplate = mongoose.model('FormTemplate');
      return FormTemplate.findOne({ _id: form.formTemplateId }).exec()
        .then(formTemplate => ({ ...context, formTemplate }));
    })
    // authorize for this form
    .then((context) => {
      const { form, formTemplate } = context;
      return requireDomainAdministratorOrUser(
        context, formTemplate.domainId,
        form.userId ? form.userId._id || form.userId : undefined);
    });
};

export default function (router, transporter) {
  register(router, {
    category: 'forms',
    modelName: 'Form',
    omit: ['get', 'post', 'put', 'delete'], // special handling below
    index: {
      authorization: requireSession,
      filterAuthorized: authorizedForDomainOrSelf,
      populate: [
        { path: 'formTemplateId', select: 'name domainId' },
        { path: 'paymentIds', select: 'amount' },
        { path: 'userId', select: 'name' },
      ],
    },
  });

  router.get('/forms/:id', (req, res) => {
    getSession(req)
      .then(requireSession)
      // get form and template and authorize
      .then(session => getFormContext(session, req.params.id, [
        { path: 'formTemplateId', select: 'name domainId' },
        { path: 'paymentIds', select: 'amount' },
        { path: 'userId', select: 'name' },
      ]))
      // set unpaid total
      .then((context) => {
        if (req.query.full) {
          return addFullness(context);
        }
        return context.form;
      })
      // respond
      .then(form => res.status(200).json(form))
      .catch(error => catcher(error, res));
  });

  router.post('/forms', (req, res) => {
    getSession(req)
      // get template
      .then((session) => {
        const data = req.body;
        const FormTemplate = mongoose.model('FormTemplate');
        return FormTemplate.findOne({ _id: data.formTemplateId }).exec()
          .then(formTemplate => ({ session, formTemplate }));
      })
      // authorize
      .then((context) => {
        const { session, formTemplate } = context;
        // AUTH
        if (!session && formTemplate.authenticate) {
          return Promise.reject({ status: 403 }); // not authorized
        }
        // determine if the person submitting the form is an administrator
        // for the template
        const admin = session && (session.userId.administrator ||
          (session.userId.domainIds &&
            session.userId.domainIds.some(id => id.equals(formTemplate.domainId))));

        const data = req.body;
        const userData = pullUserData(formTemplate, data);
        if (!session) {
          // no session, create one
          return createUserAndSession(userData)
            .then(({ session: newSession, user: formUser }) => ({
              ...context, admin, session: newSession, formUser }));
        }
        if (userData.email !== session.userId.email) {
          // Person submitting form isn't the same as what's in the form
          if (admin) {
            // admin submitting for another user
            return findOrCreateUser(userData)
              .then(formUser => ({ ...context, admin, formUser }));
          }
          return Promise.reject({
            status: 403,
            code: 'userMismatch',
            message: `The email ${userData.email} does not match the
              one used to sign in ${session.userId.email}.`,
          }); // not authorized
        }
        return ({ ...context, admin, formUser: session.userId });
      })
      // save form
      .then((context) => {
        const { admin, formTemplate, formUser } = context;
        const Form = mongoose.model('Form');
        const data = req.body;
        data.created = new Date();
        data.modified = data.created;
        // Allow an administrator to set the userId.
        if (!admin || !data.userId) {
          data.userId = formUser._id;
        }
        addFormCost(data, formTemplate);
        const form = new Form(data);
        return form.save()
          .then(formSaved => ({ ...context, form: formSaved }));
      })
      // subscribe to email list, if any
      .then((context) => {
        const { formTemplate, formUser } = context;
        if (formTemplate.emailListId) {
          return subscribe(formTemplate.emailListId, [formUser.email])
            .then(() => context);
        }
        return context;
      })
      // send emails
      .then(sendEmails(req, transporter))
      // respond
      .then((context) => {
        const { form, session } = context;
        if (!session.loginAt) {
          // we created this session here, return it
          res.status(200).json({ form, session });
        } else {
          res.status(200).send({ form });
        }
      })
      .catch(error => catcher(error, res));
  });

  router.put('/forms/:id', (req, res) => {
    const Form = mongoose.model('Form');
    const id = req.params.id;
    getSession(req)
      .then(requireSession)
      // get form and template and authorize
      .then(session => getFormContext(session, id))
      // update form
      .then((context) => {
        const { formTemplate, session } = context;
        let data = req.body;
        if (!formTemplate._id.equals(data.formTemplateId._id) &&
          !formTemplate._id.equals(data.formTemplateId)) {
          return Promise.reject({ error: 'Mismatched template' });
        }
        data.modified = new Date();
        data = unsetDomainIfNeeded(data, session);
        return Form.findOneAndUpdate({ _id: id }, data,
          { new: true, runValidators: true }).exec()
          .then(formUpdated => ({ ...context, form: formUpdated }));
      })
      // update costs
      .then((context) => {
        const { form } = context;
        return updateFormCosts({ _id: form._id })
          .then(() => context);
      })
      // send emails
      .then(sendEmails(req, transporter, true))
      // respond
      .then(context => res.status(200).json(context.form))
      .catch(error => catcher(error, res));
  });

  router.delete('/forms/:id', (req, res) => {
    getSession(req)
      .then(requireSession)
      // get form and template and authorize
      .then(session => getFormContext(session, req.params.id, [
        { path: 'userId', select: 'email' },
      ]))
      // unsubscribe from email list, if any
      .then((context) => {
        const { formTemplate, form } = context;
        if (formTemplate.emailListId) {
          return unsubscribe(formTemplate.emailListId, [form.userId.email])
            .then(() => context);
        }
        return context;
      })
      // remove form
      .then(context => context.form.remove())
      // respond
      .then(() => res.status(200).send())
      .catch(error => catcher(error, res));
  });
}
