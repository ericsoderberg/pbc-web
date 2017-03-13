import mongoose from 'mongoose';
import moment from 'moment';
import { authorize, authorizedForDomainOrSelf } from './auth';
import { useOrCreateSession } from './sessions';
import { unsetDomainIfNeeded } from './domains';
import register from './register';

mongoose.Promise = global.Promise;

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

const sendEmails = (req, transporter) => (
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
        const url = `${req.headers.origin}/forms/${form._id}/edit`;
        const instructions =
`### Thank you for filling out


# [${formTemplate.name}](${url})


### on ${moment(form.modified).format('MMMM Do YYYY')}


${formTemplate.postSubmitMessage}
`;
        transporter.sendMail({
          from: site.email,
          to: session.userId.email,
          subject: 'Thank you',
          markdown: instructions,
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
        const url = `${req.headers.origin}/forms/${form._id}/edit`;
        const instructions =
`
# [${formTemplate.name}](${url})


### Submitted by ${session.userId.name} (${session.userId.email}) on ${moment(form.modified).format('MMMM Do YYYY')}

Just letting you know.
`;
        transporter.sendMail({
          from: site.email,
          to: formTemplate.notify,
          subject: `${formTemplate.name} submittal`,
          markdown: instructions,
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

// duplicated in FormUtils
function calculateTotal(formTemplate, form) {
  let total = 0;
  formTemplate.sections.forEach((section) => {
    section.fields.forEach((templateField) => {
      if (templateField.monetary) {
        // see if we have it
        form.fields.some((field) => {
          if (field.templateFieldId.equals(templateField._id)) {
            if (templateField.type === 'count') {
              total += (parseInt(templateField.value, 10) *
                parseInt(field.value, 10));
            } else if (templateField.type === 'line') {
              if (templateField.discount) {
                total -= parseInt(field.value, 10);
              } else {
                total += parseInt(field.value, 10);
              }
            } else if (templateField.type === 'choice') {
              templateField.options.forEach((option) => {
                if (option.value && field.optionId === option._id) {
                  total += parseInt(option.value, 10);
                }
              });
            } else if (templateField.type === 'choices') {
              const optionIds = field.optionIds || [];
              templateField.options.forEach((option) => {
                if (option.value &&
                  optionIds.some(optionId => optionId.equals(option._id))) {
                  total += parseInt(option.value, 10);
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
  return Math.max(0, total);
}

function calculatePaymentsTotal(form) {
  let total = 0;
  (form.paymentIds || []).forEach((payment) => {
    total += payment.amount;
  });
  return total;
}

const setUnpaidTotal = form => (
  Promise.resolve()
  .then(() => {
    const FormTemplate = mongoose.model('FormTemplate');
    return FormTemplate.findOne({ _id: form.formTemplateId }).exec()
    .then((formTemplate) => {
      form = form.toObject();
      form.unpaidTotal =
        calculateTotal(formTemplate, form) - calculatePaymentsTotal(form);
      return form;
    });
  })
);

export default function (router, transporter) {
  register(router, {
    category: 'forms',
    modelName: 'Form',
    omit: ['post', 'put'], // special handling for POST and PUT of form below
    index: {
      authorize: authorizedForDomainOrSelf,
      populate: [
        { path: 'formTemplateId', select: 'name domainId' },
        { path: 'paymentIds', select: 'amount' },
        { path: 'userId', select: 'name' },
      ],
    },
    get: {
      populate: [
        { path: 'formTemplateId', select: 'name domainId' },
        { path: 'paymentIds', select: 'amount' },
        { path: 'userId', select: 'name' },
      ],
      transformOut: setUnpaidTotal,
    },
    put: {
      transformIn: unsetDomainIfNeeded,
    },
  });

  router.post('/forms', (req, res) => {
    authorize(req, res, false) // don't require session yet
    .then((session) => {
      const data = req.body;
      const FormTemplate = mongoose.model('FormTemplate');
      return FormTemplate.findOne({ _id: data.formTemplateId }).exec()
      .then(formTemplate => ({ session, formTemplate }));
    })
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
    .then((context) => {
      const { session, formTemplate } = context;
      const Form = mongoose.model('Form');
      const data = req.body;
      data.created = new Date();
      data.modified = data.created;
      const admin = (session.userId.administrator || (formTemplate.domainId &&
        formTemplate.domainId.equals(session.userId.administratorDomainId)));
      // Allow an administrator to set the userId. Otherwise, set it to
      // the current session user
      if (!admin || !data.userId) {
        data.userId = session.userId;
      }
      const form = new Form(data);
      return form.save()
      .then(formSaved => ({ ...context, form: formSaved }));
    })
    .then(sendEmails(req, transporter))
    .then((context) => {
      const { session } = context;
      if (!session.loginAt) {
        // we created this session here, return it
        res.status(200).json(session);
      } else {
        res.status(200).send({});
      }
    })
    .catch((error) => {
      console.error('!!! post form catch', error);
      res.status(400).json(error);
    });
  });

  router.put('/forms/:id', (req, res) => {
    authorize(req, res)
    .then((session) => {
      const id = req.params.id;
      const Form = mongoose.model('Form');
      return Form.findOne({ _id: id }).exec()
      .then(form => ({ session, form, req }));
    })
    .then((context) => {
      const { form } = context;
      // Get the FormTemplate so we can validate it hasn't changed and so
      // we can check the domainId for authorization.
      const FormTemplate = mongoose.model('FormTemplate');
      return FormTemplate.findOne({ _id: form.formTemplateId }).exec()
      .then(formTemplate => ({ ...context, formTemplate }));
    })
    .then((context) => {
      const { session, form, formTemplate } = context;
      let data = req.body;
      if (!formTemplate._id.equals(data.formTemplateId._id)) {
        return Promise.reject({ error: 'Mismatched template' });
      }
      // AUTH
      const admin = (session.userId.administrator || (formTemplate.domainId &&
        formTemplate.domainId.equals(session.userId.administratorDomainId)));
      if (!admin && !form.userId.equals(session.userId._id)) {
        return Promise.reject({ status: 403 });
      }
      data.modified = new Date();
      data = unsetDomainIfNeeded(data, session);
      return form.update(data)
      .then(formUpdated => ({ ...context, form: formUpdated }));
    })
    .then(sendEmails(req, transporter))
    .then(context => res.status(200).json(context.form))
    .catch((error) => {
      console.error('!!! post form catch', error);
      res.status(error.status || 400).json(error);
    });
  });
}
