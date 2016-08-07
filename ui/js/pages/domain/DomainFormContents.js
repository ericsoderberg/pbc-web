"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';

export default class DomainFormContents extends Component {

  componentDidMount () {
    this.refs.name.focus();
  }

  render () {
    const { formState } = this.props;
    const domain = formState.object;

    return (
      <fieldset className="form__fields">
        <FormField label="Name">
          <input ref="name" name="name" value={domain.name || ''}
            onChange={formState.change('name')}/>
        </FormField>
      </fieldset>
    );
  }
};

DomainFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};