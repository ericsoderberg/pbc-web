import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';

const FormNumber = (props) => {
  const { error, field, formTemplateField, onChange } = props;
  const { remaining } = formTemplateField;

  let min = formTemplateField.min || 0;
  let max = formTemplateField.max;
  // const value = parseFloat(field.value || min, 10);
  const initialValue = field.initialValue || field.value || 0;
  if (remaining !== undefined) {
    const initialPlusRemaining = parseFloat(initialValue, 10) + parseFloat(remaining, 10);
    max = Math.max(0, max ? Math.min(initialPlusRemaining, max) : initialPlusRemaining);
    min = Math.max(0, Math.min(min, max));
  }

  let contents = (
    <input name={formTemplateField.name}
      type="number"
      pattern="\d*"
      min={min}
      max={max}
      value={field.value}
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
    help += `${Math.max(0, remaining)} remaining`;
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
};

FormNumber.defaultProps = {
  error: undefined,
  field: {},
  remaining: undefined,
};

export default FormNumber;
