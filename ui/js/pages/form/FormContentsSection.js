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
  const { error, fields, formTemplateSection, onChange } = props;

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

  const contents = formTemplateFields.map((formTemplateField) => {
    const id = formTemplateField._id || formTemplateField.id;
    return (
      <FormContentsField key={id} formTemplateField={formTemplateField}
        field={fields[id]} error={error[id]} onChange={onChange} />
    );
  });

  return (
    <fieldset className="form__fields">
      {name}
      {contents}
    </fieldset>
  );
};

FormContentsSection.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  fields: PropTypes.object.isRequired,
  formTemplateSection: PropTypes.shape({
    fields: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

FormContentsSection.defaultProps = {
  error: {},
};

export default FormContentsSection;
