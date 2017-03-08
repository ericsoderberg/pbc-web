import React, { PropTypes } from 'react';
import FormField from '../../components/FormField';

const FormNumber = (props) => {
  const { error, field, formTemplateField, onChange } = props;

  let contents = (
    <input name={formTemplateField.name} type="number"
      min={formTemplateField.min || 0} max={formTemplateField.max}
      value={field.value || formTemplateField.min || 0}
      onChange={event => onChange({
        templateFieldId: formTemplateField._id,
        value: event.target.value,
      })} />
  );

  if (formTemplateField.value) {
    const prefix =
      `${formTemplateField.monetary ? '$' : ''}${formTemplateField.value}`;
    const amount =
      `${formTemplateField.monetary ? '$ ' : ''}` +
      `${(field.value || 0) * formTemplateField.value}`;
    const amountClasses = ['form__field-option-amount'];
    if (field.value > 0) {
      amountClasses.push('primary');
    } else {
      amountClasses.push('tertiary');
    }
    contents = (
      <div className="box--row">
        <span className="prefix">{prefix}</span>
        <span className="prefix">x</span>
        {contents}
        <span className={amountClasses.join(' ')}>{amount}</span>
      </div>
    );
  }

  return (
    <FormField label={formTemplateField.name}
      help={formTemplateField.help} error={error}>
      {contents}
    </FormField>
  );
};

FormNumber.propTypes = {
  error: PropTypes.string,
  field: PropTypes.object,
  formTemplateField: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

FormNumber.defaultProps = {
  error: undefined,
  field: {},
};

export default FormNumber;
