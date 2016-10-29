"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import TextHelp from '../../components/TextHelp';
import FormState from '../../utils/FormState';
import SectionFields from './SectionFields';

export default class TextSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange)
    });
  }

  render () {
    const { formState } = this.state;
    const section = formState.object;

    return (
      <fieldset className="form__fields">
        <FormField name="text" label="Text" help={<TextHelp />}>
          <textarea ref="text" name="text" value={section.text || ''} rows={8}
            onChange={formState.change('text')}/>
        </FormField>
        <SectionFields formState={formState} />
      </fieldset>
    );
  }
};

TextSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
