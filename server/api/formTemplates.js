import mongoose from 'mongoose';
import moment from 'moment';
import json2csv from 'json2csv';
import register from './register';
import {
  getSession, authorizedForDomain, allowAnyone, requireSomeAdministrator,
} from './auth';
import { unsetDomainIfNeeded } from './domains';
import { catcher } from './utils';

mongoose.Promise = global.Promise;

// /api/form-templates

const unsetReferences = (data) => {
  data = unsetDomainIfNeeded(data);
  if (!data.linkedFormTemplateId) {
    delete data.linkedFormTemplateId;
    if (!data.$unset) {
      data.$unset = {};
    }
    data.$unset.linkedFormTemplateId = '';
  }
  return data;
};

const fieldValue = (field, templateFieldMap, optionMap) => {
  const templateField = templateFieldMap[field.templateFieldId];
  let value;
  if (templateField.type === 'count' || templateField.type === 'number') {
    value = templateField.value * field.value;
  } else if (templateField.type === 'choice' && field.optionId) {
    const option = optionMap[field.optionId];
    value = option.value;
  } else if (templateField.type === 'choices' && field.optionIds.length > 0) {
    value = field.optionIds.map((optionId) => {
      const option = optionMap[optionId];
      return option.value;
    });
    value = value.reduce((t, v) => (t + parseFloat(v, 10)), 0);
  } else {
    value = field.value;
  }
  return value;
};

const fieldContents = (field, templateField, optionMap) => {
  let contents = field.value;
  if (templateField.type === 'count' || templateField.type === 'number') {
    let prefix;
    if (templateField.monetary) {
      prefix = '$';
    }
    contents = `${prefix}${templateField.value} x ${field.value}`;
  } else if (templateField.type === 'choice' && field.optionId) {
    contents = optionMap[field.optionId].name;
  } else if (templateField.type === 'choices' && field.optionIds) {
    contents = field.optionIds.map((optionId) => {
      const option = optionMap[optionId];
      let suffix = '';
      if (templateField.monetary) {
        suffix = ` $${option.value}`;
      }
      return `${option.name}${suffix}`;
    })
    .join(', ');
  } else if (templateField.type === 'date') {
    contents = moment(contents).format('YYYY-MM-DD');
  } else if (templateField.monetary) {
    contents = `$${contents}`;
  }
  return contents;
};

const calculateTotals = (data) => {
  const Form = mongoose.model('Form');
  return Form.find({ formTemplateId: data._id }).exec()
  .then((forms) => {
    const formTemplate = data.toObject();
    const templateFieldMap = {};
    const optionMap = {};
    const totals = {};
    const remains = {};
    formTemplate.sections.forEach((section) => {
      section.fields.forEach((field) => {
        templateFieldMap[field._id] = field;
        field.options.forEach((option) => { optionMap[option._id] = option; });
        if (field.type === 'count' || field.type === 'number'
          || field.monetary) {
          totals[field._id] = 0;
        }
        if (field.limit) {
          remains[field._id] = parseFloat(field.limit, 10);
        } else {
          field.options.forEach((option) => {
            if (option.limit !== undefined && option.limit !== null) {
              if (!remains[field._id]) {
                remains[field._id] = {};
              }
              remains[field._id][option._id] = parseFloat(option.limit, 10);
            }
          });
        }
      });
    });

    forms.forEach((form) => {
      form.fields.forEach((field) => {
        const total = totals[field.templateFieldId];
        if (total >= 0) {
          const value = parseFloat(
            fieldValue(field, templateFieldMap, optionMap), 10);
          if (value) {
            totals[field.templateFieldId] += value;
          }
        }

        const remaining = remains[field.templateFieldId];
        if (remaining !== undefined) {
          if (typeof remaining === 'object') {
            // options
            (field.optionIds || []).forEach((optionId) => {
              if (remaining[optionId] >= 0) {
                remaining[optionId] -= 1;
              }
            });
          } else {
            const templateField = templateFieldMap[field.templateFieldId];
            if (templateField.type === 'number' || templateField.type === 'count') {
              remains[field.templateFieldId] -= parseFloat(field.value, 10);
            } else {
              remains[field.templateFieldId] -= 1;
            }
          }
        }
      });
    });
    formTemplate.totals = totals;
    formTemplate.remains = remains;
    return formTemplate;
  });
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

export default function (router) {
  router.get('/form-templates/:id.csv', (req, res) => {
    getSession(req)
    .then(requireSomeAdministrator)
    .then((session) => {
      const id = req.params.id;
      const FormTemplate = mongoose.model('FormTemplate');
      return FormTemplate.findOne({ _id: id, ...authorizedForDomain(session) }).exec();
    })
    .then((formTemplate) => {
      const Form = mongoose.model('Form');
      return Form.find({ formTemplateId: formTemplate._id }).exec()
      .then(forms => ({ forms, formTemplate }));
    })
    .then((context) => {
      const { forms, formTemplate } = context;

      const fields = [];
      const fieldNames = [];
      const templateFieldMap = {};
      const optionMap = {};
      formTemplate.sections.forEach(section =>
        section.fields.filter(field => field.type !== 'instructions')
        .forEach((field) => {
          templateFieldMap[field._id] = field;
          field.options.forEach((option) => { optionMap[option._id] = option; });
          fields.push(`${field._id}`);
          fieldNames.push(field.name || section.name);
        }));
      fields.push('created');
      fieldNames.push('created');
      fields.push('modified');
      fieldNames.push('modified');

      const data = forms.map((form) => {
        const item = { created: form.created, modified: form.modified };
        form.fields.forEach((field) => {
          item[field.templateFieldId] =
            fieldContents(field, templateFieldMap, optionMap);
        });
        return item;
      });
      // console.log('!!!', fields, fieldNames);

      const csv = json2csv({ data, fields, fieldNames });

      res.attachment('data.csv');
      res.end(csv);
    })
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
      transformOut: (formTemplate, req) => {
        if (formTemplate && req.query.totals) {
          return calculateTotals(formTemplate);
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
      transformIn: unsetReferences,
      transformOut: (formTemplate) => {
        // update all Forms for this formTemplate to have the same domain
        const Form = mongoose.model('Form');
        return Form.update({ formTemplateId: formTemplate._id },
          { $set: { domainId: formTemplate.domainId } }, { multi: true }).exec()
          .then(() => formTemplate);
      },
      validate,
    },
    delete: {
      authorization: requireSomeAdministrator,
    },
  });
}
