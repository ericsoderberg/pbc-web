
export function isFieldSet(field) {
  return (field.value || field.optionId ||
    (field.optionIds && field.optionIds.length > 0));
}

function formFieldError(templateField, form) {
  let result;
  if (templateField.required && !templateField.linkedFieldId) {
    // see if we have it
    if (!form.fields.some(field => (
      field.templateFieldId === templateField._id))) {
      result = 'required';
    }
  } else if (templateField.options) {
    templateField.options.filter(option => option.required)
      .forEach((option) => {
        // see if we have it
        let found = false;
        form.fields
          .filter(field => (field.templateFieldId === templateField._id))
          .forEach((field) => {
            if (field.optionId === option._id) {
              found = true;
            } else {
              (field.optionIds || []).some((optionId) => {
                if (optionId === option._id) {
                  found = true;
                }
                return found;
              });
            }
          });
        if (!found) {
          result = 'required';
        }
      });
  }
  return result;
}

export function setFormError(formTemplate, form) {
  let error;
  // check for required fields
  formTemplate.sections.forEach((section) => {
    section.fields.forEach((templateField) => {
      const errorMessage = formFieldError(templateField, form);
      if (errorMessage) {
        if (!error) {
          error = {};
        }
        error[templateField._id] = errorMessage;
      }
    });
  });
  return error;
}

export function clearFormError(formTemplate, form, error) {
  let result = { ...error };
  formTemplate.sections.forEach((section) => {
    section.fields.forEach((templateField) => {
      const errorMessage = formFieldError(templateField, form);
      if (!errorMessage) {
        delete result[templateField._id];
      }
    });
  });
  if (Object.keys(result).length === 0) {
    result = undefined;
  }
  return result;
}

export function finalizeForm(formTemplate, form, linkedForm) {
  // find first 'name' field and set form.name to that value
  formTemplate.sections.some(section => (
    section.fields.some((templateField) => {
      if (templateField.name && templateField.name.match(/name/i)) {
        if (templateField.linkedFieldId && linkedForm) {
          linkedForm.fields.some((field) => {
            if (field.templateFieldId === templateField.linkedFieldId) {
              form.name = field.value;
              return true;
            }
            return false;
          });
        } else {
          form.fields.some((field) => {
            if (field.templateFieldId === templateField._id) {
              form.name = field.value;
              return true;
            }
            return false;
          });
        }
        return true;
      }
      return false;
    })
  ));
  form.domainId = formTemplate.domainId;
  if (linkedForm) {
    form.linkedFormId = linkedForm._id;
  }
}

export function calculateTotal(formTemplate, form) {
  let total = 0;
  formTemplate.sections.forEach((section) => {
    section.fields.forEach((templateField) => {
      if (templateField.monetary) {
        // see if we have it
        form.fields.some((field) => {
          if (field.templateFieldId === templateField._id) {
            if (templateField.type === 'number' || templateField.type === 'count') {
              total += (parseInt(templateField.value, 10) *
                parseInt(field.value, 10)) || 0;
            } else if (templateField.type === 'line') {
              if (templateField.discount) {
                total -= parseInt(field.value, 10) || 0;
              } else {
                total += parseInt(field.value, 10) || 0;
              }
            } else if (templateField.type === 'choice') {
              templateField.options.forEach((option) => {
                if (field.optionId === option._id) {
                  // old forms might have been migrated poorly, allow for name
                  total += parseInt(option.value, 10) || parseInt(option.name, 10) || 0;
                }
              });
            } else if (templateField.type === 'choices') {
              const optionIds = field.optionIds || [];
              templateField.options.forEach((option) => {
                if (optionIds.indexOf(option._id) !== -1) {
                  // old forms might have been migrated poorly, allow for name
                  total += parseInt(option.value, 10) || parseInt(option.name, 10) || 0;
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
