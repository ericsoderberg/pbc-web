import React, { PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormOptionLabel from './FormOptionLabel';

const FormChoices = (props) => {
  const { error, field, formTemplateField, onChange } = props;

  const optionIds = field.optionIds || [];
  const contents = (formTemplateField.options || []).map((option) => {
    const name = formTemplateField.name;
    const id = option._id || option.id;
    const checked = (optionIds.indexOf(id) !== -1);
    return (
      <div key={id} className="form__field-option">
        <input id={id} name={name} type="checkbox" checked={checked}
          onChange={() => onChange({
            templateFieldId: formTemplateField._id,
            optionIds: (checked ?
              optionIds.filter(id2 => id2 !== id) :
              optionIds.slice(0).concat([id])),
          })} />
        <FormOptionLabel htmlFor={id} formTemplateField={formTemplateField}
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
