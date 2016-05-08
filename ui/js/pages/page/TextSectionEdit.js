"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';

export default class TextSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ formState: new FormState(nextProps.section, nextProps.onChange) });
  }

  render () {
    const { formState } = this.state;
    const section = formState.object;

    const textHelp = (
      <a href="http://daringfireball.net/projects/markdown/syntax"
        target="_blank">Markdown syntax</a>
    );

    return (
      <fieldset className="form__fields">
        <FormField name="text" label="Text" help={textHelp}>
          <textarea ref="text" name="text" value={section.text || ''} rows={8}
            onChange={formState.change('text')}/>
        </FormField>
        <FormField label="Background color">
          <input ref="color" name="color" value={section.color || ''}
            onChange={formState.change('color')}/>
        </FormField>
      </fieldset>
    );
  }
};

TextSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
