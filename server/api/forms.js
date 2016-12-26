"use strict";
import mongoose from 'mongoose';
import hat from 'hat';
import moment from 'moment';
import { authorize, authorizedForDomainOrSelf } from './auth';
import { unsetDomainIfNeeded } from './domains';
import register from './register';

// /api/forms

const FORM_SIGN_IN_MESSAGE =
  '[Sign In](/sign-in) to be able to submit this form.';

function formValueForFieldName (formTemplate, form, fieldName) {
  let result;
  formTemplate.sections.some(section => {
    return section.fields.some(field => {
      if (field.name && field.name.toLowerCase() === fieldName.toLowerCase()) {
        return form.fields.some(field2 => {
          if (field._id.equals(field2.fieldId)) {
            result = field2.value;
            return true;
          }
        });
      }
    });
  });
  return result;
}

const sendEmails = (req, transporter) => {
  return (context) => {
    return Promise.resolve(context)
    .then(context => {
      const Site = mongoose.model('Site');
      return Site.findOne({}).exec()
      .then(site => ({ ...context, site }));
    })
    .then(context => {
      // send acknowledgement, if needed
      const { session, formTemplate, form, site } = context;
      if (formTemplate.acknowledge) {
        const url = `${req.protocol}://${req.get('Host')}` +
          `/forms/${form._id}/edit`;
        const instructions =
`### Thank you for your submittal for


# [${formTemplate.name}](${url})


### on ${moment(form.modified).format('MMMM Do YYYY')}
`;
        transporter.sendMail({
          from: site.email,
          to: session.email,
          subject: 'Thank you',
          markdown: instructions
        }, (err, info) => {
          console.log('!!! sendMail', err, info);
        });
      }
      return context;
    })
    .then(context => {
      // send notification, if needed
      const { session, formTemplate, form, site } = context;
      if (formTemplate.notify) {
        const url = `${req.protocol}://${req.get('Host')}` +
          `/forms/${form._id}/edit`;
        const instructions =
`### Submittal from ${session.name} (${session.email}) for


# [${formTemplate.name}](${url})


### on ${moment(form.modified).format('MMMM Do YYYY')}
`;
        transporter.sendMail({
          from: site.email,
          to: formTemplate.notify,
          subject: `${formTemplate.name} submittal`,
          markdown: instructions
        }, (err, info) => {
          console.log('!!! sendMail', err, info);
        });
      }
      return context;
    });
  };
};

export default function (router, transporter) {

  register(router, {
    category: 'forms',
    modelName: 'Form',
    omit: ['post', 'put'], // special handling for POST and PUT of form below
    index: {
      authorize: authorizedForDomainOrSelf,
      populate: [
        { path: 'userId', select: 'name' },
        { path: 'formTemplateId', select: 'name domainId' }
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

  router.post(`/forms`, (req, res) => {
    authorize(req, res, false) // don't require session yet
    .then(session => {
      const data = req.body;
      const FormTemplate = mongoose.model('FormTemplate');
      return FormTemplate.findOne({ _id: data.formTemplateId }).exec()
      .then(formTemplate => ({ session, formTemplate }));
    })
    .then(context => {
      const { session, formTemplate } = context;
      const data = req.body;
      if (! session) {
        // we don't have a session, try to create one
        const email = formValueForFieldName(formTemplate, data, 'email');
        const name = formValueForFieldName(formTemplate, data, 'name');
        if (! email || ! name) {
          console.log('!!! No email or name');
          return Promise.reject({ error: FORM_SIGN_IN_MESSAGE});
        }

        // see if we have an account for this email already
        console.log('!!! have an email, look for user', email);
        const User = mongoose.model('User');
        return User.findOne({ email: email }).exec()
        .then(user => {
          if (user) {
            console.log('!!! already have a user');
            return Promise.reject({ error: FORM_SIGN_IN_MESSAGE});
          }
          console.log('!!! no user, create one');

          // create a new user
          const now = new Date();
          user = new User({
            created: now,
            email: email,
            modified: now,
            name: name
          });
          return user.save();
        })
        .then(user => {
          // create a new session
          const Session = mongoose.model('Session');
          const session = new Session({
            email: user.email,
            name: user.name,
            token: hat(), // better to encrypt this before storing it, someday
            userId: user._id
          });
          return session.save();
        })
        .then(session => ({ ...context, session, formTemplate }));
      } else {
        return context;
      }
    })
    .then(context => {
      const { session, formTemplate } = context;
      const Form = mongoose.model('Form');
      let data = req.body;
      data.created = new Date();
      data.modified = data.created;
      // Allow an administrator to set the userId. Otherwise, set it to
      // the current session user
      if (! data.userId ||
        ! (session.administrator || (formTemplate.domainId &&
          formTemplate.domainId.equals(session.administratorDomainId)))) {
        data.userId = session.userId;
      }
      const form = new Form(data);
      return form.save()
      .then(form => ({ ...context, form }));
    })
    .then(sendEmails(req, transporter))
    .then(context => {
      const { session } = context;
      if (! session.loginAt) {
        // we created this session here, return it
        res.status(200).json(session);
      } else {
        res.status(200).send({});
      }
    })
    .catch(error => {
      console.log('!!! post form catch', error);
      res.status(400).json(error);
    });
  });

  router.put(`/forms/:id`, (req, res) => {
    authorize(req, res)
    .then(session => {
      const id = req.params.id;
      const Form = mongoose.model('Form');
      return Form.findOne({ _id: id }).exec()
      .then(form => ({ session, form, req }));
    })
    .then(context => {
      const { form } = context;
      // Get the FormTemplate so we can validate it hasn't changed and so
      // we can check the domainId for authorization.
      const FormTemplate = mongoose.model('FormTemplate');
      return FormTemplate.findOne({ _id: form.formTemplateId }).exec()
      .then(formTemplate => ({ ...context, formTemplate }));
    })
    .then(context => {
      const { session, form, formTemplate } = context;
      let data = req.body;
      if (! formTemplate._id.equals(data.formTemplateId)) {
        return Promise.reject({ error: 'Mismatched template' });
      }
      // Allow an administrator to set the userId. Otherwise, set it to
      // the current session user
      if (! data.userId ||
        ! (session.administrator || (formTemplate.domainId &&
          formTemplate.domainId.equals(session.administratorDomainId)))) {
        data.userId = session.userId;
      }
      data.modified = new Date();
      data = unsetDomainIfNeeded(data, session);
      return form.update(data)
      .then(form => ({ ...context, form }));
    })
    .then(sendEmails(req, transporter))
    .then(context => res.status(200).json(context.form))
    .catch(error => {
      console.log('!!! post form catch', error);
      res.status(400).json(error);
    });
  });
}
