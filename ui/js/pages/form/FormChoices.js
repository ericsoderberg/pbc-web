import React, { PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormOptionLabel from './FormOptionLabel';

const FormChoices = (props) => {
  const { error, field, formTemplateField, onChange } = props;

  const optionIds = field.optionIds || [];
  const contents = (formTemplateField.options || []).map((option) => {
    const name = formTemplateField.name;
    const checked = (optionIds.indexOf(option._id) !== -1);
    return (
      <div key={option._id || option.id} className="form__field-option">
        <input name={name} type="checkbox" checked={checked}
          onChange={() => onChange({
            templateFieldId: formTemplateField._id,
            optionIds: (checked ?
              optionIds.filter(id => id !== option._id) :
              optionIds.slice(0).concat([option._id])),
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

FormChoices.propTypes = {
  error: PropTypes.string,
  field: PropTypes.object,
  formTemplateField: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

FormChoices.defaultProps = {
  error: undefined,
  field: {},
};

export default FormChoices;
