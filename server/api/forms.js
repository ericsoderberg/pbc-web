import mongoose from 'mongoose';
import {
  getSession, authorizedForDomainOrSelf, requireSession,
  requireDomainAdministratorOrUser,
} from './auth';
import { useOrCreateSession } from './sessions';
import { unsetDomainIfNeeded } from './domains';
import { renderNotification } from './email';
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
        const message = `Thank you for ${gerund}${suffix}.`;
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

// duplicated in FormUtils, TODO: remove from UI and rely on server entirely
export const addFormTotals = (formTemplate, form) => {
  let totalCost = 0;
  formTemplate.sections.forEach((section) => {
    section.fields.forEach((templateField) => {
      if (templateField.monetary) {
        // see if we have it
        form.fields.some((field) => {
          if (field.templateFieldId.equals(templateField._id)) {
            if (templateField.type === 'count' || templateField.type === 'number') {
              totalCost += (parseInt(templateField.value, 10) *
                parseInt(field.value, 10));
            } else if (templateField.type === 'line') {
              if (templateField.discount) {
                totalCost -= parseInt(field.value, 10);
              } else {
                totalCost += parseInt(field.value, 10);
              }
            } else if (templateField.type === 'choice') {
              templateField.options.forEach((option) => {
                if (option.value && field.optionId === option._id) {
                  totalCost += parseInt(option.value, 10);
                }
              });
            } else if (templateField.type === 'choices') {
              const optionIds = field.optionIds || [];
              templateField.options.forEach((option) => {
                if (option.value &&
                  optionIds.some(optionId => optionId.equals(option._id))) {
                  totalCost += parseInt(option.value, 10);
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

  let paidAmount = 0;
  (form.paymentIds || []).forEach((payment) => {
    paidAmount += payment.amount;
  });

  form.totalCost = Math.max(0, totalCost);
  form.paidAmount = paidAmount;
};

const setUnpaidTotal = form => (
  Promise.resolve()
  .then(() => {
    const FormTemplate = mongoose.model('FormTemplate');
    return FormTemplate.findOne({ _id: form.formTemplateId }).exec()
    .then((formTemplate) => {
      form = form.toObject();
      addFormTotals(formTemplate, form);
      return form;
    });
  })
);

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
      context, formTemplate.domainId, form.userId._id || form.userId);
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
    .then(context => setUnpaidTotal(context.form))
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
        return Promise.reject({ status: 403 });
      }
      const data = req.body;
      const userData = pullUserData(formTemplate, data);
      return useOrCreateSession(session, userData)
      .then(session2 => ({ ...context, session: session2 }));
    })
    // save form
    .then((context) => {
      const { session, formTemplate } = context;
      const Form = mongoose.model('Form');
      const data = req.body;
      data.created = new Date();
      data.modified = data.created;
      const admin = (session.userId.administrator ||
        (session.userId.administratorDomainId &&
        session.userId.administratorDomainId.equals(formTemplate.domainId)));
      // Allow an administrator to set the userId. Otherwise, set it to
      // the current session user
      if (!admin || !data.userId) {
        data.userId = session.userId;
      }
      const form = new Form(data);
      return form.save()
      .then(formSaved => ({ ...context, form: formSaved }));
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
    getSession(req)
    .then(requireSession)
    // get form and template and authorize
    .then(session => getFormContext(session, req.params.id))
    // update form
    .then((context) => {
      const { form, formTemplate, session } = context;
      let data = req.body;
      if (!formTemplate._id.equals(data.formTemplateId._id)) {
        return Promise.reject({ error: 'Mismatched template' });
      }
      data.modified = new Date();
      data = unsetDomainIfNeeded(data, session);
      return form.update(data)
      .then(formUpdated => ({ ...context, form: formUpdated }));
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
    .then(session => getFormContext(session, req.params.id))
    // remove form
    .then(context => context.form.remove())
    // respond
    .then(() => res.status(200).send())
    .catch(error => catcher(error, res));
  });
}
