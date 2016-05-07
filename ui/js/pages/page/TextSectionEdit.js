"use strict";
import React, { PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormEvents from '../../utils/FormEvents';

const TextSectionEdit = (props) => {
  const { section, onChange } = props;
  const formEvents = new FormEvents(section, onChange);
  const help = (
    <a href="http://daringfireball.net/projects/markdown/syntax"
      target="_blank">Markdown syntax</a>
  );

  return (
    <fieldset className="form__fields">
      <FormField name="text" label="Text" help={help}>
        <textarea name="text" value={section.text || ''} rows={8}
          onChange={formEvents.change('text')}/>
      </FormField>
    </fieldset>
  );
};

TextSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};

export default TextSectionEdit;
