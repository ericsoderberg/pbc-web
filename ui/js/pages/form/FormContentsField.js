import React, { PropTypes } from 'react';
import FormInstructions from './FormInstructions';
import FormLine from './FormLine';
import FormLines from './FormLines';
import FormChoice from './FormChoice';
import FormChoices from './FormChoices';
import FormNumber from './FormNumber';
import FormDate from './FormDate';

const TYPE_COMPONENT = {
  instructions: FormInstructions,
  line: FormLine,
  lines: FormLines,
  choice: FormChoice,
  choices: FormChoices,
  count: FormNumber,
  number: FormNumber,
  date: FormDate,
};

const FormContentsField = (props) => {
  const { error, field, formTemplateField, onChange } = props;
  const Component = TYPE_COMPONENT[formTemplateField.type];
  return (
    <Component key={formTemplateField._id || formTemplateField.id}
      formTemplateField={formTemplateField} field={field}
      onChange={onChange} error={error} />
  );
};

FormContentsField.propTypes = {
  error: PropTypes.string,
  field: PropTypes.object,
  formTemplateField: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

FormContentsField.defaultProps = {
  error: undefined,
  field: undefined,
};

export default FormContentsField;
