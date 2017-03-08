import React, { PropTypes } from 'react';
import FormContentsField from './FormContentsField';

// const _field = (fields, templateFieldId) => {
//   let result;
//   fields.some((field) => {
//     if (field.templateFieldId === templateFieldId) {
//       result = field;
//       return true;
//     }
//     return false;
//   });
//   return result;
// };

const FormContentsSection = (props) => {
  const { fields, formTemplateSection, onChange } = props;

  const formTemplateFields = (formTemplateSection.fields || [])
  .filter(formTemplateField => (
    !formTemplateField.dependsOnId || fields[formTemplateField.dependsOnId]
  ));

  let name;
  if (formTemplateSection.name) {
    name = (
      <div className="form__text">
        <h2>{formTemplateSection.name}</h2>
      </div>
    );
  }

  const contents = formTemplateFields.map(formTemplateField => (
    <FormContentsField key={formTemplateField._id || formTemplateField.id}
      formTemplateField={formTemplateField}
      field={fields[formTemplateField.id]} onChange={onChange} />
  ));

  return (
    <fieldset className="form__fields">
      {name}
      {contents}
    </fieldset>
  );
};

FormContentsSection.propTypes = {
  fields: PropTypes.object.isRequired,
  formTemplateSection: PropTypes.shape({
    fields: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FormContentsSection;
