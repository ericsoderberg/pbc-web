
export function dependableFieldsAndOptions(formTemplate, templateSection, templateField) {
  const result = [];
  (formTemplate.sections || []).some((section) => {
    if (templateSection &&
      (section._id || section.id) === (templateSection._id || templateSection.id)) {
      return true;
    }
    return (section.fields || []).some((field) => {
      if (templateField &&
        (field.id || field._id) === (templateField.id || templateField._id)) {
        return true;
      }
      if (field.type !== 'instructions') {
        result.push({ id: field._id || field.id, name: field.name || field.type });
        if (field.type === 'choice' || field.type === 'choices') {
          field.options.forEach((option) => {
            result.push({
              id: option._id || option.id,
              name: `${field.name || ''} - ${option.name || option.value}`,
            });
          });
        }
      }
      return false;
    });
  });
  return result;
}
