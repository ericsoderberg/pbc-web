import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormField from './FormField';
import FormState from '../utils/FormState';
import SectionEdit from './SectionEdit';

export default class ImageSectionEdit extends Component {

  constructor(props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange),
    });
  }

  render() {
    const { formState } = this.state;
    const section = formState.object;
    const imageHelp = (
      <span>
        {"Don't forget to "}
        <a href="https://tinyjpg.com" target="_blank" rel="noreferrer noopener">
          optimize
        </a>!
      </span>
    );

    return (
      <SectionEdit formState={formState}>
        <FormField name="image"
          label="Image"
          help={imageHelp}
          onDrop={formState.dropImageFile('image')}>
          <img className="form-field__image"
            alt=""
            src={section.image ? section.image.data : ''} />
          <input name="image"
            type="file"
            onChange={formState.changeImageFile('image')} />
        </FormField>
      </SectionEdit>
    );
  }
}

ImageSectionEdit.propTypes = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired,
};
