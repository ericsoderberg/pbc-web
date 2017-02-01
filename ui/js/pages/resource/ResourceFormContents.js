"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';

export default class ResourceFormContents extends Component {

  render () {
    const { className, formState } = this.props;
    const resource = formState.object;

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input name="name" value={resource.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
        </fieldset>
      </div>
    );
  }
};

ResourceFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
