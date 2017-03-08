import React, { PropTypes } from 'react';
import FormField from '../../components/FormField';

const FormLines = (props) => {
  const { error, field, formTemplateField, onChange } = props;

  return (
    <FormField label={formTemplateField.name}
      help={formTemplateField.help} error={error}>
      <textarea name={formTemplateField.name} value={field.value || ''}
        onChange={event =>
          onChange(formTemplateField._id, event.target.value)} />
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
