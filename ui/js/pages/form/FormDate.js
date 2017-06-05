import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';
import DateInput from '../../components/DateInput';

const FormDate = (props) => {
  const { error, field, formTemplateField, onChange } = props;

  return (
    <FormField label={formTemplateField.name}
      help={formTemplateField.help}
      error={error}>
      <DateInput name={formTemplateField.name}
        value={field.value || ''}
        onChange={date => onChange({
          templateFieldId: formTemplateField._id,
          value: date,
        })} />
    </FormField>
  );
};

FormDate.propTypes = {
  error: PropTypes.string,
  field: PropTypes.object,
  formTemplateField: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

FormDate.defaultProps = {
  error: undefined,
  field: {},
};

export default FormDate;
