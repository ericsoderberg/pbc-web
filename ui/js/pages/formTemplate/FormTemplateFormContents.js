"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';

export default class FormTemplateFormContents extends Component {

  componentDidMount () {
    this.refs.name.focus();
  }

  render () {
    const { formState } = this.props;
    const formTemplate = formState.object;

    return (
      <fieldset className="form__fields">
        <FormField label="Name">
          <input ref="name" name="name" value={formTemplate.name || ''}
            onChange={formState.change('name')}/>
        </FormField>
      </fieldset>
    );
  }
};

FormTemplateFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
