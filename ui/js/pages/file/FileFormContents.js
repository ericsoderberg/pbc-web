"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';

export default class FileFormContents extends Component {

  render () {
    const { className, formState } = this.props;
    const file = formState.object;

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input ref="name" name="name" value={resource.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
        </fieldset>
      </div>
    );
  }
};

FileFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
