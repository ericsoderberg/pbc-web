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
  const {
    error, field, formTemplateField, linkedForm, linkedFormControl, onChange,
  } = props;
  const Component = TYPE_COMPONENT[formTemplateField.type];
  let linkedField;
  if (formTemplateField.linkedFieldId && linkedForm) {
    linkedForm.fields.some((field2) => {
      if (field2.templateFieldId === formTemplateField.linkedFieldId) {
        linkedField = field2;
      }
      return linkedField;
    });
  }
  return (
    <Component key={formTemplateField._id || formTemplateField.id}
      formTemplateField={formTemplateField} field={field}
      linkedField={linkedField} linkedFormControl={linkedFormControl}
      onChange={onChange} error={error} />
  );
};

FormContentsField.propTypes = {
  error: PropTypes.string,
  field: PropTypes.object,
  formTemplateField: PropTypes.object.isRequired,
  linkedForm: PropTypes.object,
  linkedFormControl: PropTypes.element,
  onChange: PropTypes.func.isRequired,
};

FormContentsField.defaultProps = {
  error: undefined,
  field: undefined,
  linkedForm: undefined,
  linkedFormControl: undefined,
};

export default FormContentsField;
