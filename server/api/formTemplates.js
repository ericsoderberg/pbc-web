import mongoose from 'mongoose';
import moment from 'moment-timezone';
import json2csv from 'json2csv';
import register from './register';
import {
  getSession, authorizedForDomain, allowAnyone, requireSomeAdministrator,
} from './auth';
import { renderEmail } from './email';
import { catcher, unsetEmptyFields } from './utils';

mongoose.Promise = global.Promise;

// /api/form-templates

const UNSETTABLE_FIELDS = [
  'acknowledgeMessage', 'anotherLabel', 'domainId', 'emailListId',
  'linkedFormTemplateId', 'payable', 'payByCheckInstructions',
  'postSubmitMessage', 'submitLabel',
];

const fieldValue = (field, templateFieldMap, optionMap) => {
  const templateField = templateFieldMap[field.templateFieldId] || {};
  let value;
  if (templateField.type === 'count' || templateField.type === 'number') {
    value = (templateField.value || 1) * field.value;
  } else if (templateField.type === 'choice' && field.optionId) {
    const option = optionMap[field.optionId] || {}; // in case removed
    value = option.value || option.name || '';
  } else if (templateField.type === 'choices' && field.optionIds.length > 0) {
    value = field.optionIds.map((optionId) => {
      const option = optionMap[optionId] || {}; // in case removed
      return option.value || option.name || '';
    });
    if (templateField.monetary) {
      value = `$${value.reduce((t, v) => (t + parseFloat(v, 10)), 0)}`;
    } else {
      value = value.join(',');
    }
  } else {
    ({ value } = field);
  }
  return value;
};

const fieldContents = (field, templateField, optionMap, value = false) => {
  let contents = field.value;
  if (templateField.type === 'count' || templateField.type === 'number') {
    // let prefix = '';
    // if (templateField.value) {
    //   prefix = `${templateField.monetary ? '$ ' : ''}${templateField.value || ''} x`;
    // }
    // contents = `${prefix}${field.value}`;
    contents = field.value;
  } else if (templateField.type === 'choice' && field.optionId) {
    const option = optionMap[field.optionId] || {};
    contents = value ? `$${(option.value || 0)}` : (option.name || '');
  } else if (templateField.type === 'choices' && field.optionIds) {
    contents = field.optionIds.map((optionId) => {
      const option = optionMap[optionId] || {}; // in case removed
      return value ? (option.value || 0) : (option.name || '');
    });
    if (value) {
      return `$${contents.reduce((t, v) => (t + parseFloat(v, 10)), 0)}`;
    }
    return contents.join(', ');
  } else if (templateField.type === 'date') {
    const date = moment(contents);
    if (date.isValid()) {
      contents = date.format('YYYY-MM-DD');
    }
  } else if (templateField.monetary) {
    contents = `$${contents}`;
  }
  return contents;
};

export const addNewForm = (data, session, options = {}) => {
  const formTemplate = data.toObject ? data.toObject() : data;
  const form = {
    fields: [],
    formTemplateId: formTemplate._id,
    linkedFormId: options.linkedFormId,
  };
  formTemplate.sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (session && options.preFill && field.linkToUserProperty) {
        // pre-fill out fields from session user
        form.fields.push({
          templateFieldId: field._id,
          value: session.userId[field.linkToUserProperty],
        });
      }
      // respect any limits
      if (field.type === 'number' && field.min) {
        form.fields.push({
          templateFieldId: field._id,
          value: field.min,
        });
      }
    });
  });
  formTemplate.newForm = form;
  return formTemplate;
};

const initializeTotals = (formTemplate) => {
  // initialize maps for fields and options and their totals and remaining
  const templateFieldMap = {};
  const optionMap = {};

  formTemplate.sections.forEach((section) => {
    section.fields.forEach((field) => {
      // build maps so we can hash using ids
      templateFieldMap[field._id] = field;
      field.options.forEach((option) => { optionMap[option._id] = option; });

      if (field.type === 'count' || field.type === 'number'
        || field.monetary) {
        field.total = 0;
      }
      if (field.limit) {
        field.remaining = parseFloat(field.limit, 10);
      } else {
        field.options.forEach((option) => {
          if (option.limit !== undefined && option.limit !== null) {
            option.remaining = parseFloat(option.limit, 10);
          }
        });
      }
    });
  });

  return { templateFieldMap, optionMap };
};

export const addFormTemplateTotals = (data) => {
  const formTemplate = data.toObject ? data.toObject() : data;
  const Form = mongoose.model('Form');
  return Form.find({ formTemplateId: formTemplate._id })
    .exec()
    .then((forms) => {
      const { templateFieldMap, optionMap } = initializeTotals(formTemplate);
      let total = 0;
      let paid = 0;
      let received = 0;

      forms.forEach((form) => {
        total += form.cost.total;
        paid += form.cost.paid;
        received += form.cost.received;

        form.fields.forEach((field) => {
          const templateField = templateFieldMap[field.templateFieldId];
          if (templateField && templateField.total >= 0) {
            const value = parseFloat(
              fieldValue(field, templateFieldMap, optionMap),
              10,
            );
            if (value) {
              templateField.total += value;
            }
          }

          if (templateField && templateField.remaining !== undefined) {
            if (templateField.type === 'number' || templateField.type === 'count') {
              templateField.remaining -= parseFloat(field.value, 10);
            } else {
              templateField.remaining -= 1;
            }
          }

          if (templateField && templateField.options) {
            let selectedOptions = [];
            if (field.optionId) {
              selectedOptions.push(field.optionId);
            } else {
              selectedOptions = selectedOptions.concat(field.optionIds || []);
            }
            templateField.options.filter(o => o.remaining !== undefined)
              .forEach((option) => {
                selectedOptions.forEach((optionId) => {
                  if (option._id.equals(optionId)) {
                    option.remaining -= 1;
                  }
                });
              });
          }
        });
      });

      const balance = total - paid;
      const unreceived = total - received;
      formTemplate.cost = {
        balance, paid, received, total, unreceived,
      };

      return formTemplate;
    });
};

export const addForms = (data, forSession) => {
  const formTemplate = data.toObject ? data.toObject() : data;
  const Form = mongoose.model('Form');
  const criteria = { formTemplateId: formTemplate._id };
  if (forSession) {
    criteria.userId = forSession.userId._id;
  }
  return Form.find(criteria)
    .populate({ path: 'paymentIds', select: 'amount' })
    .populate({ path: 'userId', select: 'name email' })
    .sort('-modified')
    .exec()
    .then((forms) => {
      formTemplate.forms = forms;
      return formTemplate;
    });
};

export const addLinkedFormTemplate = (data, forSession) => {
  const formTemplate = data.toObject ? data.toObject() : data;
  const FormTemplate = mongoose.model('FormTemplate');
  if (formTemplate.linkedFormTemplateId) {
    const linkedId =
      formTemplate.linkedFormTemplateId._id || formTemplate.linkedFormTemplateId;
    return FormTemplate.findOne({ _id: linkedId })
      .exec()
      .then(linkedData => addForms(linkedData, forSession))
      .then(linkedData => addNewForm(linkedData, forSession))
      .then((linkedFormTemplate) => {
        formTemplate.linkedFormTemplate = linkedFormTemplate;
        return formTemplate;
      });
  }
  return formTemplate;
};

const validate = (data) => {
  // ensure that either authenticate is true or
  // we have a required field linked to the session email
  if (data.authenticate) {
    return data;
  }
  if (data.sections.some(section =>
    section.fields.some((field) => {
      if (field.linkToUserProperty === 'email' && field.required) {
        return true;
      }
      return false;
    }))) {
    return data;
  }
  return Promise.reject(`Must either require authentication
    or have a required field tied to the session user email.`);
};

export default function (router, transporter) {
  router.get('/form-templates/:id.csv', (req, res) => {
    const FormTemplate = mongoose.model('FormTemplate');
    const Form = mongoose.model('Form');
    getSession(req)
      .then(requireSomeAdministrator)
      .then((session) => {
        const { params: { id } } = req;
        return FormTemplate.findOne({ _id: id, ...authorizedForDomain(session) })
          .exec()
          .then(formTemplate => ({ formTemplate, session }));
      })
      .then((context) => {
        const { formTemplate, session } = context;
        if (formTemplate.linkedFormTemplateId) {
          return FormTemplate.findOne({
            _id: formTemplate.linkedFormTemplateId,
            ...authorizedForDomain(session),
          }).exec()
            .then(linkedFormTemplate => ({ formTemplate, linkedFormTemplate }));
        }
        return context;
      })
      .then((context) => {
        const query = Form.find();
        if (req.query.search) {
          const exp = new RegExp(req.query.search, 'i');
          query.find({ name: exp });
        }
        if (req.query.filter) {
          let filter = JSON.parse(req.query.filter);
          if (typeof filter === 'string') {
            // need double de-escape,
            // first to de-string and then to de-stringify
            filter = JSON.parse(filter);
          }
          if (filter.created && Array.isArray(filter.created)) {
            filter.created = {
              $gte: new Date(filter.created[0]),
              $lte: new Date(filter.created[1]),
            };
          }
          query.find(filter);
        }
        if (req.query.sort) {
          query.sort(req.query.sort);
        }
        return query.exec()
          .then(forms => ({ ...context, forms }));
      })
      .then((context) => {
        const { linkedFormTemplate } = context;
        if (linkedFormTemplate) {
          return Form.find({ formTemplateId: linkedFormTemplate._id }).exec()
            .then((forms) => {
              const linkedForms = {};
              forms.forEach((form) => { linkedForms[form._id] = form; });
              return { ...context, linkedForms };
            });
        }
        return context;
      })
      .then((context) => {
        const {
          forms, formTemplate, linkedFormTemplate, linkedForms,
        } = context;

        const fields = [];
        const fieldNames = [];
        const templateFieldMap = {};
        const linkedTemplateFieldIdMap = {};
        const optionMap = {};

        formTemplate.sections.forEach(section =>
          section.fields.filter(field => field.type !== 'instructions')
            .forEach((field) => {
              templateFieldMap[field._id] = field;
              field.options.forEach((option) => {
                optionMap[option._id] = option;
              });
              fields.push(`${field._id}`);
              fieldNames.push(field.name || field.type);
              if (field.monetary && (field.type === 'choice' || field.type === 'choices')) {
                fields.push(`${field._id}-amount`);
                fieldNames.push(`${field.name || field.type} amount`);
              }
              if (field.linkedFieldId) {
                linkedTemplateFieldIdMap[field._id] = field.linkedFieldId;
              }
              if (field.name && field.name.match(/birthday/i)) {
                field.birthday = true;
                fields.push('age');
                fieldNames.push('Age');
              }
            }));

        if (formTemplate.payable) {
          fields.push('balance');
          fieldNames.push('Balance');
          addFormTemplateTotals(formTemplate);
        }

        fields.push('created');
        fieldNames.push('created');
        fields.push('modified');
        fieldNames.push('modified');

        if (linkedFormTemplate) {
          linkedFormTemplate.sections.forEach(section =>
            section.fields.forEach((field) => {
              templateFieldMap[field._id] = field;
              field.options.forEach((option) => {
                optionMap[option._id] = option;
              });
              fields.push(`${field._id}`);
              fieldNames.push(field.name || section.name || '');
              if (field.name && field.name.match(/birthday/i)) {
                field.birthday = true;
                fields.push('age');
                fieldNames.push('Age');
              }
            }));
        }

        const data = forms.map((form) => {
          const item = { created: form.created, modified: form.modified };
          const linkedForm =
            form.linkedFormId ? linkedForms[form.linkedFormId] : undefined;

          form.fields.forEach((field) => {
            const templateField = templateFieldMap[field.templateFieldId];
            if (templateField) {
              item[field.templateFieldId] =
                fieldContents(field, templateField, optionMap);
              if (templateField.monetary) {
                item[`${field.templateFieldId}-amount`] =
                  fieldContents(field, templateField, optionMap, true);
              }
              if (templateField.birthday) {
                item.age = moment(field.value).fromNow(true);
              }
            }
          });

          if (linkedForm) {
            // look for linked fields
            Object.keys(linkedTemplateFieldIdMap).forEach((templateFieldId) => {
              linkedForm.fields.some((linkedField) => {
                if (linkedField.templateFieldId
                  .equals(linkedTemplateFieldIdMap[templateFieldId])) {
                  const templateField =
                    templateFieldMap[linkedField.templateFieldId];
                  if (templateField) {
                    item[templateFieldId] =
                      fieldContents(linkedField, templateField, optionMap);
                    if (templateField.monetary) {
                      item[`${templateFieldId}-amount`] =
                        fieldContents(linkedField, templateField, optionMap, true);
                    }
                  }
                  return true;
                }
                return false;
              });
            });

            linkedForm.fields.forEach((field) => {
              const templateField = templateFieldMap[field.templateFieldId];
              if (templateField) {
                item[field.templateFieldId] =
                  fieldContents(field, templateField, optionMap);
                if (templateField.monetary) {
                  item[`${field.templateFieldId}-amount`] =
                    fieldContents(field, templateField, optionMap, true);
                }
                if (templateField.birthday) {
                  item.age = moment(field.value).fromNow(true);
                }
              }
            });
          }

          if (formTemplate.payable) {
            const balance = form.cost.total - form.cost.paid;
            if (balance) {
              item.balance = `$${balance}`;
            }
          }

          return item;
        });

        // console.log('!!!', fields, fieldNames);

        const csv = json2csv({ data, fields, fieldNames });

        res.attachment(`${formTemplate.name}.csv`);
        res.end(csv);
      })
      .catch(error => catcher(error, res));
  });

  router.post('/form-templates/:id/email', (req, res) => {
    const FormTemplate = mongoose.model('FormTemplate');
    const Site = mongoose.model('Site');
    const { params: { id } } = req;
    const { body: { contents } } = req;
    getSession(req)
      .then(requireSomeAdministrator)
      .then(session =>
        FormTemplate.findOne({ _id: id }).exec()
          .then(addForms)
          .then(formTemplate => ({ session, formTemplate })))
      .then((context) => {
        const markup = renderEmail(contents);
        return { ...context, markup };
      })
      .then((context) => {
        const { formTemplate } = context;
        // generate array of email addresses
        const addresses = formTemplate.forms.map(f => f.userId.email);
        return { ...context, addresses };
      })
      .then(context => Site.findOne({}).exec()
        .then(site => ({ ...context, site })))
      .then((context) => {
        const {
          addresses, formTemplate, markup, session, site,
        } = context;
        return new Promise((resolve, reject) => {
          transporter.sendMail({
            from: site.email,
            to: session.userId.email,
            bcc: addresses,
            subject: formTemplate.name,
            html: markup,
            text: contents,
          }, (err, info) => {
            if (err) { reject(err); } else { resolve(info); }
          });
        });
      })
      .then(() => res.status(200).json({}))
      .catch(error => catcher(error, res));
  });

  register(router, {
    category: 'form-templates',
    modelName: 'FormTemplate',
    index: {
      authorization: requireSomeAdministrator,
      filterAuthorized: authorizedForDomain,
      populate: [
        { path: 'linkedFormTemplateId', select: 'name' },
      ],
    },
    get: {
      authorization: allowAnyone,
      populate: [
        { path: 'linkedFormTemplateId', select: 'name' },
      ],
      transformOut: (formTemplate, req, session) => {
        // only add forms and totals if there is a session
        if (req.query.new) {
          // reset modified time to now to avoid caching issues with sessions
          formTemplate.modified = moment.utc();
          formTemplate = addNewForm(formTemplate, session, {
            preFill: req.query.preFill,
            linkedFormId: req.query.linkedFormId,
          });
        }
        const admin = (session && (session.userId.administrator ||
          (session.userId.domainIds &&
          session.userId.domainIds.some(id => id.equals(formTemplate.domainId)))));
        if (req.query.full && session) {
          // reset modified time to now to avoid caching issues when deleting forms
          formTemplate.modified = moment.utc();
          const forSession = ((req.query.forSession || !admin) ? session : undefined);
          return addForms(formTemplate, forSession)
            .then(data => addFormTemplateTotals(data))
            .then(data => addLinkedFormTemplate(data, forSession));
        }
        if (req.query.totals) {
          // reset modified time to now to avoid caching issues when deleting forms
          formTemplate.modified = moment.utc();
          return addFormTemplateTotals(formTemplate);
        }
        return formTemplate;
      },
    },
    post: {
      authorization: requireSomeAdministrator,
      validate,
    },
    put: {
      authorization: requireSomeAdministrator,
      transformIn: data => unsetEmptyFields(data, UNSETTABLE_FIELDS),
      transformOut: (formTemplate) => {
        // update all Forms for this formTemplate to have the same domain
        const Form = mongoose.model('Form');
        return Form.update(
          { formTemplateId: formTemplate._id },
          { $set: { domainId: formTemplate.domainId } }, { multi: true },
        ).exec()
          .then(() => formTemplate);
      },
      validate,
    },
    delete: {
      authorization: requireSomeAdministrator,
    },
  });

  // router.get('/form-templates/:id', (req, res) => {
  //   getSession(req)
  //   .then(allowAnyone)
  //   .then((session) => {
  //     const id = req.params.id;
  //     const FormTemplate = mongoose.model('FormTemplate');
  //     return FormTemplate.findOne({ _id: id })
  //     .populate({ path: 'linkedFormTemplateId', select: 'name' })
  //     .exec()
  //     .then((formTemplate) => {
  //       if (!formTemplate) {
  //         res.status(404);
  //         return Promise.reject({ status: 404 });
  //       }
  //       return { session, formTemplate };
  //     });
  //   })
  //   // add forms and totals, if requested
  //   .then((context) => {
  //     const { session } = context;
  //     let { formTemplate } = context;
  //     // only add forms and totals if there is a session
  //     if (req.query.full && session) {
  //       formTemplate = addForms(formTemplate, req.query.forSession ? session : undefined);
  //     }
  //     return formTemplate;
  //   })
  //   // respond
  //   .then(formTemplate => res.status(200).json(formTemplate))
  //   .catch(error => catcher(error, res));
  // });
}
