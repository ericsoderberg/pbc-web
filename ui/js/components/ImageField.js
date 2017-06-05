import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormField from './FormField';

export default class ImageField extends Component {

  render() {
    const { formState, help, label, name, property } = this.props;
    const image = formState.object[property];

    let result;
    if (image) {
      const darkName = `${name}-dark`;
      result = (
        <FormField label={label} help={help}>
          <div>
            <img className="image-field__image" alt="" src={image.data} />
          </div>
          <div className="image-field__controls">
            <span>
              <input id={darkName}
                name={darkName}
                type="checkbox"
                checked={image.dark}
                onChange={() => formState.set(property,
                  { ...image, dark: !image.dark })} />
              <label htmlFor={darkName}>Dark</label>
            </span>
            <span>
              <input id={name}
                name={name}
                type="checkbox"
                checked={false}
                onChange={() => formState.set(property, undefined)} />
              <label htmlFor={name}>Clear</label>
            </span>
          </div>
        </FormField>
      );
    } else {
      const imageHelp = help || (
        <span>
          {"Don't forget to "}
          <a href="https://tinyjpg.com" target="_blank" rel="noreferrer noopener">
            optimize
          </a>!
        </span>
      );

      result = (
        <FormField label={label}
          help={imageHelp}
          onDrop={formState.dropImageFile(property)}>
          <input name={name}
            type="file"
            onChange={formState.changeImageFile(property)} />
        </FormField>
      );
    }

    return result;
  }
}

ImageField.propTypes = {
  formState: PropTypes.object.isRequired,
  help: PropTypes.string,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  property: PropTypes.string.isRequired,
};

ImageField.defaultProps = {
  help: undefined,
};
