"use strict";
import React, { PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormEvents from '../../utils/FormEvents';

const ImageSectionEdit = (props) => {
  const { section, onChange } = props;
  const formEvents = new FormEvents(section, onChange);
  const help = (
    <span>
      {"Don't forget to "}
      <a href="https://tinyjpg.com" target="_blank">optimize</a>!
    </span>
  );

  return (
    <fieldset className="form__fields">
      <FormField name="image" label="Image" help={help}>
        <img className="form-field__image"
          src={section.image ? section.image.data : ''} />
        <input name="image" type="file"
          onChange={formEvents.changeFile('image')}/>
      </FormField>
      <FormField>
        <input name="full" type="checkbox"
          checked={section.full || false}
          onChange={formEvents.toggle('full')}/>
        <label htmlFor="full">Edge to edge</label>
      </FormField>
    </fieldset>
  );
};

ImageSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};

export default ImageSectionEdit;
