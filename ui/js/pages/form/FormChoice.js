import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';
import FormOptionLabel from './FormOptionLabel';

const FormChoice = (props) => {
  const { error, field, formTemplateField, onChange } = props;

  const contents = (formTemplateField.options || []).map((option) => {
    const name = formTemplateField._id || formTemplateField.id;
    const id = option._id || option.id;
    const checked = (field.optionId === id);
    const remaining = option.remaining;
    return (
      <div key={id} className="form__field-option">
        <input id={id}
          name={name}
          type="radio"
          checked={checked}
          onChange={() => onChange({
            templateFieldId: formTemplateField._id,
            optionId: id,
          })} />
        <FormOptionLabel htmlFor={id}
          formTemplateField={formTemplateField}
          option={option}
          selected={checked}
          remaining={remaining} />
      </div>
    );
  });

  return (
    <FormField label={formTemplateField.name}
      help={formTemplateField.help}
      error={error}>
      {contents}
    </FormField>
  );
};

FormChoice.propTypes = {
  error: PropTypes.string,
  field: PropTypes.object,
  formTemplateField: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

FormChoice.defaultProps = {
  error: undefined,
  field: {},
};

export default FormChoice;
