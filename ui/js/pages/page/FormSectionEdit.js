"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import SelectSearch from '../../components/SelectSearch';
import FormState from '../../utils/FormState';
import SectionEdit from './SectionEdit';

export default class FormSectionEdit extends Component {

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
      <SectionEdit formState={formState}>
        <FormField name="formTemplateId" label="Form template">
          <SelectSearch category="form-templates"
            value={(section.formTemplateId || {}).name || ''}
            onChange={(suggestion) =>
              formState.change('formTemplateId')({
                _id: suggestion._id, name: suggestion.name })} />
        </FormField>
      </SectionEdit>
    );
  }
};

FormSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
