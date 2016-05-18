"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from './FormField';

export default class ImageField extends Component {

  render () {
    const { formState, property, label, name } = this.props;
    const image = formState.object[property];

    let result;
    if (image) {
      
      result = (
        <FormField label={label}>
          <div>
            <img className="image-field__image" src={image.data} />
          </div>
          <input name={name} type="checkbox"
            checked={image || false}
            onChange={() => formState.set(property, false)}/>
          <label htmlFor={name}>Clear</label>
        </FormField>
      );

    } else {

      const imageHelp = (
        <span>
          {"Don't forget to "}
          <a href="https://tinyjpg.com" target="_blank">optimize</a>!
        </span>
      );

      result = (
        <FormField label={label} help={imageHelp}
          onDrop={formState.dropFile(property)}>
          <input name={name} type="file"
            onChange={formState.changeFile(property)}/>
        </FormField>
      );
    }

    return result;
  }
}

ImageField.propTypes = {
  formState: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  property: PropTypes.string.isRequired
};
