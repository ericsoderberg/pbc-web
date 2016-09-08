"use strict";
import mongoose from 'mongoose';
import hat from 'hat';
import { authorize, authorizedForDomainOrSelf, unsetDomainIfNeeded }
  from './auth';
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

export default function (router) {

  register(router, 'forms', 'Form', {
    authorize: {
      index: authorizedForDomainOrSelf
    },
    omit: ['post', 'put'], // special handling for POST and PUT of form below
    populate: {
      get: [
        { path: 'userId', select: 'name' }
      ],
      index: [
        { path: 'userId', select: 'name' },
        { path: 'formTemplateId', select: 'name domainId' }
      ]
    },
    transformIn: {
      put: unsetDomainIfNeeded
    }
  });

  router.post(`/forms`, (req, res) => {
    authorize(req, res, false) // don't require session yet
    .then(session => {
      const data = req.body;
      const FormTemplate = mongoose.model('FormTemplate');
      return FormTemplate.findOne({ _id: data.formTemplateId }).exec()
      .then(formTemplate => ({
        formTemplate: formTemplate,
        session: session
      }));
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
        .then(session => ({
          formTemplate: formTemplate,
          session: session
        }));
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
      .then(doc => {
        if (! session.loginAt) {
          // we created this session here, return it
          res.status(200).json(session);
        } else {
          res.status(200).send({});
        }
      });
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
      .then(form => {
        // Get the FormTemplate so we can validate it hasn't changed and so
        // we can check the domainId for authorization.
        const FormTemplate = mongoose.model('FormTemplate');
        return FormTemplate.findOne({ _id: form.formTemplateId }).exec()
        .then(formTemplate => {
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
          return form.update(data);
        });
      });
    })
    .then(doc => res.status(200).json(doc))
    .catch(error => {
      console.log('!!! post form catch', error);
      res.status(400).json(error);
    });
  });
}
