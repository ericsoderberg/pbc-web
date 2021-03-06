import mongoose from 'mongoose';
import '../db';
import { loadCategoryArray } from './utils';
import results from './results';

mongoose.Promise = global.Promise;

// FormTemplate + Form

const FIELD_TYPES = {
  area: 'lines',
  count: 'count',
  field: 'line',
  instructions: 'instructions',
  'multiple choice': 'choices',
  'multiple lines': 'lines',
  'single choice': 'choice',
  'single line': 'line',
};

function normalizeField(item, options) {
  item.oldId = item.id;
  item.type = FIELD_TYPES[item.field_type];
  item.value = item.unit_value;
  item.options = (options[item.id] || []).map((option) => {
    option.oldId = option.id;
    return option;
  });
  return item;
}

function normalizeFormTemplate(item, sections, sectionFields,
  formFields, options) {
  item.oldId = item.id;
  item.created = item.created_at;
  item.modified = item.updated_at;
  item.authenticate = item.authenticated;
  item.submitLabel = item.submit_label;
  item.sections = (sections[item.id] || []).map((section) => {
    section.oldId = section.id;
    section.fields = (sectionFields[section.id] || [])
      .map(field => normalizeField(field, options));
    return section;
  });
  if (formFields[item.id] && !sections[item.id]) {
    item.sections = [{
      fields: formFields[item.id].map(field => normalizeField(field, options)) }];
  }
  return item;
}

function normalizePayment(item, userIds) {
  item.oldId = item.id;
  item.created = item.created_at;
  item.modified = item.updated_at;
  item.amount = item.amount_cents / 100.0;
  if (item.received_notes) {
    item.notes = `${item.notes}${'\n'}${item.received_notes}`;
  }
  item.received = item.received_at;
  item.sent = item.sent_at;
  item.temporaryToken = item.verification_key;
  item.userId = userIds[item.user_id];
  return item;
}

function normalizeForm(item, fields, options, formTemplates, payments,
  userIds) {
  const template = formTemplates[item.form_id];

  // map field ids
  const templateFields = {}; // form_field.id => templateField
  template.sections.forEach((section) => {
    section.fields.forEach((field) => { templateFields[field.oldId] = field; });
  });

  item.oldId = item.id;
  item.created = item.created_at;
  item.modified = item.updated_at;

  item.fields = fields[item.id].map((field) => {
    const templateField = templateFields[field.form_field_id];
    field.oldId = field.id;
    field.templateFieldId = templateField._id;

    if (options[field.id]) {
      // map options ids
      const templateOptions = {}; // filled_field_option.id => templateOption doc
      templateField.options.forEach((option) => {
        templateOptions[option.oldId] = option;
      });
      const logContext = () => {
        console.error('!!! item', item);
        console.error('!!! field', field);
        console.error('!!! templateField', templateField);
        console.error('!!! options', options[field.id]);
        console.error('!!! templateOptions', templateOptions);
      };

      if (templateField.type === 'choice') {
        const option = options[field.id][0];
        if (!templateOptions[option.form_field_option_id]) logContext();
        field.optionId = templateOptions[option.form_field_option_id]._id;
      } else {
        field.optionIds = options[field.id].map((option) => {
          if (!templateOptions[option.form_field_option_id]) logContext();
          return templateOptions[option.form_field_option_id]._id;
        });
      }
    }

    return field;
  });

  item.formTemplateId = template._id;
  if (item.payment_id) {
    item.paymentIds = [payments[item.payment_id]._id];
  }
  if (item.user_id) {
    item.userId = userIds[item.user_id];
  }
  return item;
}

export default function () {
  const FormTemplate = mongoose.model('FormTemplate');
  const User = mongoose.model('User');
  const Payment = mongoose.model('Payment');
  const Form = mongoose.model('Form');

  const formTemplates = {}; // oldId => doc
  const payments = {}; // oldId => doc
  const userIds = {}; // oldId => _id

  return Promise.resolve()
  .then(() => {
    const options = {}; // old field.id => [item ...]
    loadCategoryArray('form_field_options').forEach((item) => {
      if (!options[item.form_field_id]) {
        options[item.form_field_id] = [];
      }
      options[item.form_field_id].push(item);
    });

    const sectionFields = {}; // old form.id | form_section.id => [item, ...]
    const formFields = {}; // old form.id | form_section.id => [item, ...]
    loadCategoryArray('form_fields').forEach((item) => {
      if (item.form_section_id) {
        if (!sectionFields[item.form_section_id]) {
          sectionFields[item.form_section_id] = [];
        }
        sectionFields[item.form_section_id].push(item);
      } else {
        if (!formFields[item.form_id]) {
          formFields[item.form_id] = [];
        }
        formFields[item.form_id].push(item);
      }
    });

    const sections = {}; // old form.id => [item, ...]
    loadCategoryArray('form_sections').forEach((item) => {
      if (!sections[item.form_id]) {
        sections[item.form_id] = [];
      }
      sections[item.form_id].push(item);
    });

    const promises = [];
    const names = {}; // prevent duplicate names
    loadCategoryArray('forms').forEach((item) => {
      names[item.name] = item.id;
      promises.push(FormTemplate.findOne({ oldId: item.id }).exec()
      .then((formTemplate) => {
        if (formTemplate) {
          return results.skipped('FormTemplate', formTemplate);
        }
        while (names[item.name] && names[item.name] !== item.id) {
          item.name = `${item.name} 2`;
        }
        item = normalizeFormTemplate(item, sections, sectionFields,
          formFields, options);
        formTemplate = new FormTemplate(item);
        return formTemplate.save()
        .then(formTemplateSaved => results.saved('FormTemplate', formTemplateSaved))
        .catch(error => results.errored('FormTemplate', formTemplate, error));
      })
      .then((formTemplate) => { formTemplates[item.id] = formTemplate; }));
    });
    return Promise.all(promises);
  })
  .then(() => {
    // load Users so we can map ids
    return User.find({}).select('oldId').exec()
    .then((users) => {
      users.forEach((user) => {
        if (user.oldId) {
          userIds[user.oldId] = user._id;
        }
      });
    });
  })
  .then(() => {
    // User ids have been mapped, now do payments
    const promises = [];
    loadCategoryArray('payments').forEach((item) => {
      promises.push(Payment.findOne({ oldId: item.id }).exec()
      .then((payment) => {
        if (payment) {
          return results.skipped('Payment', payment);
        }
        item = normalizePayment(item, userIds);
        payment = new Payment(item);
        return payment.save()
        .then(paymentSaved => results.saved('Payment', paymentSaved))
        .catch(error => results.errored('Payment', payment, error));
      })
      .then((payment) => { payments[item.id] = payment; }));
    });
    return Promise.all(promises);
  })
  .then(() => {
    // Form templates and payments have been saved, now do forms

    const options = {}; // old filled_field.id => [item ...]
    loadCategoryArray('filled_field_options').forEach((item) => {
      if (!options[item.filled_field_id]) {
        options[item.filled_field_id] = [];
      }
      options[item.filled_field_id].push(item);
    });

    const fields = {}; // old filled_form.id => [item, ...]
    loadCategoryArray('filled_fields').forEach((item) => {
      if (!fields[item.filled_form_id]) {
        fields[item.filled_form_id] = [];
      }
      fields[item.filled_form_id].push(item);
    });

    const promises = [];
    loadCategoryArray('filled_forms').forEach((item) => {
      promises.push(Form.findOne({ oldId: item.id }).exec()
      .then((form) => {
        if (form) {
          return results.skipped('Form', form);
        }
        item = normalizeForm(item, fields, options, formTemplates, payments,
          userIds);
        form = new Form(item);
        return form.save()
        .then(formSaved => results.saved('Form', formSaved))
        .catch(error => results.errored('Form', form, error));
      }));
    });
    return Promise.all(promises);
  })
  .then(() => console.log('!!! forms done'))
  .catch(error => console.error('!!! forms catch', error, error.stack));
}
