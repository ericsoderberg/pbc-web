import React, { PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormOptionLabel from './FormOptionLabel';

const FormChoice = (props) => {
  const { error, field, formTemplateField, onChange, remaining } = props;

  const contents = (formTemplateField.options || []).map((option) => {
    const name = formTemplateField._id || formTemplateField.id;
    const id = option._id || option.id;
    const checked = (field.optionId === id);
    return (
      <div key={id} className="form__field-option">
        <input id={id} name={name} type="radio"
          checked={checked}
          onChange={() => onChange({
            templateFieldId: formTemplateField._id,
            optionId: id,
          })} />
        <FormOptionLabel htmlFor={id} formTemplateField={formTemplateField}
          option={option} selected={checked} remaining={remaining[id]} />
      </div>
    );
  });

  return (
    <FormField label={formTemplateField.name}
      help={formTemplateField.help} error={error}>
      {contents}
    </FormField>
  );
};

FormChoice.propTypes = {
  error: PropTypes.string,
  field: PropTypes.object,
  formTemplateField: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  remaining: PropTypes.object,
};

FormChoice.defaultProps = {
  error: undefined,
  field: {},
  remaining: {},
};

export default FormChoice;
