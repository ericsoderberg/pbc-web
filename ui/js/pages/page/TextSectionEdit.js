"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormEvents from '../../utils/FormEvents';

export default class TextSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formEvents: new FormEvents(section, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    this.state.formEvents.set(nextProps.section);
  }

  render () {
    const { section } = this.props;
    const { formEvents } = this.state;
    const help = (
      <a href="http://daringfireball.net/projects/markdown/syntax"
        target="_blank">Markdown syntax</a>
    );

    return (
      <fieldset className="form__fields">
        <FormField name="text" label="Text" help={help}>
          <textarea ref="text" name="text" value={section.text || ''} rows={8}
            onChange={formEvents.change('text')}/>
        </FormField>
        <FormField label="Background color">
          <input ref="color" name="color" value={section.color || ''}
            onChange={formEvents.change('color')}/>
        </FormField>
      </fieldset>
    );
  }
};

TextSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};

export default TextSectionEdit;
