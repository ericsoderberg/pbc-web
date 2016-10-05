"use strict";

export function setFormError (formTemplate, form) {
  let error;
  // check for required fields
  formTemplate.sections.forEach(section => {
    section.fields.forEach(templateField => {
      if (templateField.required) {
        // see if we have it
        if (! form.fields.some(field => (
          field.templateFieldId === templateField._id && field.value))) {
          if (! error) {
            error = {};
          }
          error[templateField._id] = 'required';
        }
      }
    });
  });
  return error;
}

export function clearFormError (formTemplate, form, error) {
  error = { ...error };
  formTemplate.sections.forEach(section => {
    section.fields.forEach(templateField => {
      if (templateField.required) {
        // see if we have it
        if (form.fields.some(field => (
          field.templateFieldId === templateField._id && field.value))) {
          delete error[templateField._id];
        }
      }
    });
  });
  return error;
}

export function finalizeForm (formTemplate, form) {
  // find first 'name' field and set form.name to that value
  formTemplate.sections.some(section => {
    section.fields.some(templateField => {
      if (templateField.name && templateField.name.match(/name/i)) {
        form.fields.some(field => {
          if (field.templateFieldId === templateField._id) {
            form.name = field.value;
            return true;
          }
        });
        return true;
      }
    });
  });
  form.domainId = formTemplate.domainId;
}

export function calculateTotal (formTemplate, form) {
  let total = 0;
  formTemplate.sections.forEach(section => {
    section.fields.forEach(templateField => {
      if (templateField.monetary) {
        // see if we have it
        form.fields.some(field => {
          if (field.templateFieldId === templateField._id) {
            if ('count' === templateField.type) {
              total += (parseInt(templateField.value, 10) *
                parseInt(field.value, 10));
            } else if ('line' === templateField.type) {
              if (templateField.discount) {
                total -= parseInt(field.value, 10);
              } else {
                total += parseInt(field.value, 10);
              }
            }
            return true;
          }
        });
        return true;
      }
    });
  });
  return Math.max(0, total);
}
