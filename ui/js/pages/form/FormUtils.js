
export function isFieldSet(field) {
  return (field.value || field.optionId ||
    (field.optionIds && field.optionIds.length > 0));
}

export function setFormError(formTemplate, form) {
  let error;
  // check for required fields
  formTemplate.sections.forEach((section) => {
    section.fields.forEach((templateField) => {
      if (templateField.required) {
        // see if we have it
        if (!form.fields.some(field => (
          field.templateFieldId === templateField._id))) {
          if (!error) {
            error = {};
          }
          error[templateField._id] = 'required';
        }
      }
    });
  });
  return error;
}

export function clearFormError(formTemplate, form, error) {
  const result = { ...error };
  formTemplate.sections.forEach((section) => {
    section.fields.forEach((templateField) => {
      if (templateField.required) {
        // see if we have it
        if (form.fields.some(field => (
          field.templateFieldId === templateField._id && isFieldSet(field)))) {
          delete result[templateField._id];
        }
      }
    });
  });
  return result;
}

export function finalizeForm(formTemplate, form) {
  // find first 'name' field and set form.name to that value
  formTemplate.sections.some(section => (
    section.fields.some((templateField) => {
      if (templateField.name && templateField.name.match(/name/i)) {
        form.fields.some((field) => {
          if (field.templateFieldId === templateField._id) {
            form.name = field.value;
            return true;
          }
          return false;
        });
        return true;
      }
      return false;
    })
  ));
  form.domainId = formTemplate.domainId;
}

export function calculateTotal(formTemplate, form) {
  let total = 0;
  formTemplate.sections.forEach((section) => {
    section.fields.forEach((templateField) => {
      if (templateField.monetary) {
        // see if we have it
        form.fields.some((field) => {
          if (field.templateFieldId === templateField._id) {
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
                if (field.optionId === option._id && option.value) {
                  total += parseInt(option.value, 10);
                }
              });
            } else if (templateField.type === 'choices') {
              const optionIds = field.optionIds || [];
              templateField.options.forEach((option) => {
                if (optionIds.indexOf(option._id) !== -1 && option.value) {
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
