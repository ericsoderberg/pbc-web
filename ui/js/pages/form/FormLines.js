import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';

const FormLines = (props) => {
  const { error, field, formTemplateField, onChange } = props;

  return (
    <FormField label={formTemplateField.name}
      help={formTemplateField.help}
      error={error}>
      <div className="textarea-print">{field.value}</div>
      <textarea name={formTemplateField.name}
        value={field.value || ''}
        onChange={event => onChange({
          templateFieldId: formTemplateField._id,
          value: event.target.value,
        })} />
    </FormField>
  );
};

FormLines.propTypes = {
  error: PropTypes.string,
  field: PropTypes.object,
  formTemplateField: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

FormLines.defaultProps = {
  error: undefined,
  field: {},
};

export default FormLines;
