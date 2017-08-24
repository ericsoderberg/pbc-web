import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';

const FormLine = (props) => {
  const {
    error, field, formTemplateField, linkedField, linkedFormControl, onChange,
  } = props;

  let type = 'text';
  if (formTemplateField.name && formTemplateField.name.match(/^email/i)) {
    type = 'email';
  } else if (formTemplateField.name && formTemplateField.name.match(/^phone/i)) {
    type = 'tel';
  }

  let contents;
  if (linkedField) {
    contents = (
      <input name={formTemplateField.name}
        type={type}
        value={linkedField.value || ''}
        disabled={true} />
    );
  } else {
    contents = (
      <input name={formTemplateField.name}
        type={type}
        value={field.value || ''}
        onChange={event => onChange({
          templateFieldId: formTemplateField._id,
          value: event.target.value,
        })} />
    );
  }
  if (formTemplateField.monetary) {
    let amount;
    if (field.value) {
      amount = (
        <span className="form__field-option-amount primary">
          $ {field.value}
        </span>
      );
    }
    contents = (
      <div className="box--row">
        <span className="prefix">$</span>
        {contents}
        {amount}
      </div>
    );
  }

  return (
    <FormField label={formTemplateField.name}
      help={formTemplateField.help}
      error={error}>
      {contents}
      {linkedFormControl}
    </FormField>
  );
};

FormLine.propTypes = {
  error: PropTypes.string,
  field: PropTypes.object,
  formTemplateField: PropTypes.object.isRequired,
  linkedField: PropTypes.object,
  linkedFormControl: PropTypes.element,
  onChange: PropTypes.func.isRequired,
};

FormLine.defaultProps = {
  error: undefined,
  field: {},
  linkedField: undefined,
  linkedFormControl: undefined,
};

export default FormLine;
