import mongoose from 'mongoose';
import '../db';

mongoose.Promise = global.Promise;

// Migrate childrens ministry registration forms

const FormTemplate = mongoose.model('FormTemplate');
const Form = mongoose.model('Form');

const CHILD_VALUE_INDEXES = [
  [0, 0, 0, 1], // name
  [0, 2, 0, 3], // birthday
  [0, 8, 0, 4], // school
  [3, 1, 1, 6], // signature
  [3, 2, 1, 7], // date
];

const CHILD_OPTION_INDEXES = [
  [0, 1, 0, 0, 2, 0], // gender - male
  [0, 1, 1, 0, 2, 1], // gender - female
];

const PARENT_VALUE_INDEXES = [
  [0, 3, 1, 0], // name
  [0, 4, 1, 2], // email
  [0, 19, 1, 3], // phone
];

const NO_REGEXP = new RegExp(/^\s*no\s*$|^\s*n\/a\s*$|^\s*none\s*$/, 'i');
const DATE_REGEXP = new RegExp(/^\s*(\d{1,2)\/(\d{1,2})\/(\d{2,4})\s*$/);
const DATE_REGEXP2 = new RegExp(/^\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})\s*$/);
const DATE_REGEXP3 = new RegExp(/^\s*(\d{1,2})-(\d{1,2})-(\d{2,4})\s*$/);

const getFieldId = (template, sectionIndex, fieldIndex) =>
  template.sections[sectionIndex].fields[fieldIndex]._id;

const getOptionId = (template, sectionIndex, fieldIndex, optionIndex) =>
  template.sections[sectionIndex].fields[fieldIndex].options[optionIndex]._id;

const findField = (form, templateFieldId) => {
  let result;
  form.fields.some((field) => {
    if (field.templateFieldId.equals(templateFieldId)) {
      result = field;
    }
    return result;
  });
  return result;
};

const transferField = (form, oldTemplateFieldId, fields, newTemplateFieldId) => {
  const field = findField(form, oldTemplateFieldId);
  if (field) {
    // convert dates to ISO format
    let value = field.value;
    const match = value.match(DATE_REGEXP) || value.match(DATE_REGEXP2)
      || value.match(DATE_REGEXP3);
    if (match) {
      value = `${(`20${match[3]}`).slice(-4)}-${(`00${match[1]}`).slice(-2)}-${(`00${match[2]}`).slice(-2)}`;
    }
    // console.log('!!!', value);
    fields.push({
      // optionId: field.optionId,
      // optionIds: field.optionIds,
      templateFieldId: newTemplateFieldId,
      value,
    });
  }
  return fields;
};

const transferFieldOption = (form, oldTemplateFieldId, oldTemplateOptionId,
  fields, newTemplateFieldId, newTemplateOptionId) => {
  const field = findField(form, oldTemplateFieldId);
  if (field && field.optionId.equals(oldTemplateOptionId)) {
    fields.push({
      optionId: newTemplateOptionId,
      // optionIds: field.optionIds,
      templateFieldId: newTemplateFieldId,
    });
  }
  return fields;
};

Promise.resolve({})
// get parent template
.then(context => FormTemplate.findOne({ oldId: 161 }).exec()
  .then(parentFormTemplate => ({ ...context, parentFormTemplate })))
// get child template
.then(context => FormTemplate.findOne({ oldId: 160 }).exec()
  .then(childFormTemplate => ({ ...context, childFormTemplate })))
// get parents
.then(context => Form.find({ formTemplateId: context.parentFormTemplate._id })
  .exec().then(parentForms => ({ ...context, parentForms })))
// get children
.then(context => Form.find({ formTemplateId: context.childFormTemplate._id })
  .exec().then(childForms => ({ ...context, childForms })))
.then(context => FormTemplate.findOne({ name: 'Child Registration' }).exec()
  .then(formTemplate => ({ ...context, formTemplate })))
.then((context) => {
  const {
    childForms, childFormTemplate, formTemplate, parentForms,
    parentFormTemplate,
  } = context;
  const promises = childForms.map((childForm) => {
    let fields = [];

    // value fields
    CHILD_VALUE_INDEXES.forEach((i) => {
      fields = transferField(childForm, getFieldId(childFormTemplate, i[0], i[1]),
        fields, getFieldId(formTemplate, i[2], i[3]));
    });

    // option fields
    CHILD_OPTION_INDEXES.forEach((i) => {
      fields = transferFieldOption(
        childForm,
        getFieldId(childFormTemplate, i[0], i[1]),
        getOptionId(childFormTemplate, i[0], i[1], i[2]),
        fields,
        getFieldId(formTemplate, i[3], i[4]),
        getOptionId(formTemplate, i[3], i[4], i[5]),
      );
    });

    // merge fields
    const notes = [];
    const allergies = findField(childForm, getFieldId(childFormTemplate, 0, 4));
    if (allergies && !allergies.value.match(NO_REGEXP)) {
      notes.push(allergies.value);
    }
    const conditions = findField(childForm, getFieldId(childFormTemplate, 0, 5));
    if (conditions && !conditions.value.match(NO_REGEXP)) {
      notes.push(conditions.value);
    }
    const questions = findField(childForm, getFieldId(childFormTemplate, 2, 0));
    if (questions && !questions.value.match(NO_REGEXP)) {
      notes.push(questions.value);
    }
    if (notes.length > 0) {
      fields.push({
        templateFieldId: getFieldId(formTemplate, 0, 5),
        value: notes.join('\n'),
      });
    }

    // acknowledgements
    const optionIds = [];
    const liability = findField(childForm, getFieldId(childFormTemplate, 1, 2));
    if (liability && liability.optionIds.length > 0) {
      optionIds.push(getOptionId(formTemplate, 1, 5, 0));
    }
    const media = findField(childForm, getFieldId(childFormTemplate, 1, 0));
    if (media && media.optionIds.length > 0) {
      optionIds.push(getOptionId(formTemplate, 1, 5, 1));
    }
    const sunday = findField(childForm, getFieldId(childFormTemplate, 1, 1));
    if (sunday && sunday.optionIds.length > 0) {
      optionIds.push(getOptionId(formTemplate, 1, 5, 2));
    }
    if (optionIds.length > 0) {
      fields.push({ templateFieldId: getFieldId(formTemplate, 1, 5), optionIds });
    }

    // find corresponding parent form based on user id
    const parents = parentForms.filter(f => childForm.userId.equals(f.userId))
    .sort((f1, f2) => f2.modified - f1.modified);
    if (parents.length > 0) {
      const parentForm = parents[0];
      PARENT_VALUE_INDEXES.forEach((i) => {
        fields = transferField(parentForm, getFieldId(parentFormTemplate, i[0], i[1]),
          fields, getFieldId(formTemplate, i[2], i[3]));
      });

      // convert relationship options to value
      const relationship = findField(parentForm, getFieldId(parentFormTemplate, 0, 5));
      if (relationship) {
        const fatherId = getOptionId(parentFormTemplate, 0, 5, 0);
        const motherId = getOptionId(parentFormTemplate, 0, 5, 1);
        const otherId = getOptionId(parentFormTemplate, 0, 5, 2);
        let value = '?';
        if (relationship.optionId.equals(fatherId)) {
          value = 'father';
        } else if (relationship.optionId.equals(motherId)) {
          value = 'mother';
        } else if (relationship.optionId.equals(otherId)) {
          value = 'other';
        }
        fields.push({ templateFieldId: getFieldId(formTemplate, 1, 1), value });
      }

      // alernate contacts
      const contacts = [];
      const otherParent = findField(parentForm, getFieldId(parentFormTemplate, 0, 7));
      const otherParentPhone = findField(parentForm, getFieldId(parentFormTemplate, 0, 18));
      if (otherParent && otherParentPhone) {
        contacts.push(`${otherParent.value} ${otherParentPhone.value}`);
      }
      const emergencyName = findField(parentForm, getFieldId(parentFormTemplate, 0, 12));
      const emergencyPhone = findField(parentForm, getFieldId(parentFormTemplate, 0, 20));
      if (emergencyName && emergencyPhone) {
        contacts.push(`${emergencyName.value} ${emergencyPhone.value}`);
      }
      if (contacts.length > 0) {
        fields.push({
          templateFieldId: getFieldId(formTemplate, 1, 4),
          value: contacts.join('\n'),
        });
      }
    }

    const data = {
      created: childForm.created,
      domainId: childForm.domainId,
      fields,
      formTemplateId: formTemplate._id,
      name: childForm.name,
      modified: childForm.modified,
      userId: childForm.userId,
    };
    const form = new Form(data);
    return form.save();
  });
  return Promise.all(promises);
})
.then(() => console.log('!!! form translate done'))
.catch(error => console.log('!!! form translate catch', error, error.stack));
