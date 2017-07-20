import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';

const FormNumber = (props) => {
  const { error, field, formTemplateField, onChange } = props;
  const { remaining } = formTemplateField;

  const value = parseFloat(field.value || formTemplateField.min || 0, 10);
  const initialValue = field.initialValue || value || 0;
  let max = formTemplateField.max;
  if (remaining !== undefined) {
    const initialPlusRemaining = initialValue + remaining;
    max = max ? Math.min(initialPlusRemaining, max) : initialPlusRemaining;
  }

  let contents = (
    <input name={formTemplateField.name}
      type="number"
      min={formTemplateField.min || 0}
      max={max}
      value={value}
      onChange={event =>
        onChange({
          templateFieldId: formTemplateField._id,
          value: Math.min(parseFloat(event.target.value, 10), max),
          initialValue,
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
      <div className="box--row box--static">
        <span className="prefix">{prefix}</span>
        <span className="prefix">x</span>
        {contents}
        <span className={amountClasses.join(' ')}>{amount}</span>
      </div>
    );
  }

  let help = formTemplateField.help || '';
  if (remaining !== undefined) {
    help += `${remaining} remaining`;
  }

  return (
    <FormField label={formTemplateField.name}
      help={help}
      error={error}>
      {contents}
    </FormField>
  );
};

FormNumber.propTypes = {
  error: PropTypes.string,
  field: PropTypes.object,
  formTemplateField: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  remaining: PropTypes.number,
};

FormNumber.defaultProps = {
  error: undefined,
  field: {},
  remaining: undefined,
};

export default FormNumber;
