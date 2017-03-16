import mongoose from 'mongoose';
import register from './register';
import { authorizedForDomain } from './auth';
import { unsetDomainIfNeeded } from './domains';

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

const calculateTotals = (data) => {
  const Form = mongoose.model('Form');
  return Form.find({ formTemplateId: data._id }).exec()
  .then((forms) => {
    const formTemplate = data.toObject();
    const templateFieldMap = {};
    const optionMap = {};
    const totals = {};
    formTemplate.sections.forEach((section) => {
      section.fields.forEach((field) => {
        templateFieldMap[field._id] = field;
        field.options.forEach((option) => { optionMap[option._id] = option; });
        if (field.type === 'count' || field.type === 'number' ||
        field.monetary) {
          totals[field._id] = 0;
        }
      });
    });
    forms.forEach((form) => {
      form.fields.forEach((field) => {
        const total = totals[field.templateFieldId];
        if (total >= 0) {
          const value = parseFloat(
            fieldValue(field, templateFieldMap, optionMap),
            10);
          if (value) {
            totals[field.templateFieldId] += value;
          }
        }
      });
    });
    formTemplate.totals = totals;
    return formTemplate;
  });
};

export default function (router) {
  register(router, {
    category: 'form-templates',
    modelName: 'FormTemplate',
    index: {
      authorize: authorizedForDomain,
      populate: [
        { path: 'linkedFormTemplateId', select: 'name' },
      ],
    },
    get: {
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
    put: {
      transformIn: unsetReferences,
      transformOut: (formTemplate) => {
        // update all Forms for this formTemplate to have the same domain
        const Form = mongoose.model('Form');
        return Form.update({ formTemplateId: formTemplate._id },
          { $set: { domainId: formTemplate.domainId } }, { multi: true }).exec()
          .then(() => formTemplate);
      },
    },
  });
}
