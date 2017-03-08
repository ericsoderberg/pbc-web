import React, { PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormOptionLabel from './FormOptionLabel';

const FormChoice = (props) => {
  const { error, field, formTemplateField, onChange } = props;

  const contents = (formTemplateField.options || []).map((option) => {
    const name = formTemplateField.name;
    const checked = (field.optionId === option._id);
    return (
      <div key={option._id || option.id} className="form__field-option">
        <input name={name} type="radio" checked={checked}
          onChange={() => onChange({
            templateFieldId: formTemplateField._id,
            optionId: option._id,
          })} />
        <FormOptionLabel name={name} formTemplateField={formTemplateField}
          option={option} selected={checked} />
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
};

FormChoice.defaultProps = {
  error: undefined,
  field: {},
};

export default FormChoice;
