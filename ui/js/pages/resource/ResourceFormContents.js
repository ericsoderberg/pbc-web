"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';

export default class ResourceFormContents extends Component {

  render () {
    const { formState } = this.props;
    const resource = formState.object;

    return (
      <fieldset className="form__fields">
        <FormField label="Name">
          <input name="name" value={resource.name || ''}
            onChange={formState.change('name')}/>
        </FormField>
      </fieldset>
    );
  }
};

ResourceFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
