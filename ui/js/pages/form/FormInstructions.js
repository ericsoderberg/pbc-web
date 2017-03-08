import React, { PropTypes } from 'react';
import Markdown from 'markdown-to-jsx';

const FormInstructions = props => (
  <div className="form__text">
    <Markdown>{props.formTemplateField.help}</Markdown>
  </div>
);

FormInstructions.propTypes = {
  formTemplateField: PropTypes.object.isRequired,
};

export default FormInstructions;
