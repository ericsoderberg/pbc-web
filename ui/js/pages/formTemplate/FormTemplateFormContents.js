"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormTemplateSectionEdit from './FormTemplateSectionEdit';

export default class FormTemplateFormContents extends Component {

  constructor () {
    super();
  }

  render () {
    const { formState } = this.props;
    const formTemplate = formState.object;

    const sections = (formTemplate.sections || []).map((section, index) => {

      const raise = (index === 0 ? undefined : (
        <button type="button"
          onClick={formState.swapWith('sections', index, index-1)}>up</button>
      ));
      const lower = (index === (formTemplate.sections.length - 1) ? undefined : (
        <button type="button"
          onClick={formState.swapWith('sections', index, index+1)}>down</button>
        ));

      let header;
      if (formTemplate.sections.length > 1) {
        header = (
          <div className="form__fields-header">
            <legend>{`Section ${index + 1}`}</legend>
            <span>
              {raise}
              {lower}
              <button type="button"
                onClick={formState.removeAt('sections', index)}>remove</button>
            </span>
          </div>
        );
      }


      return (
        <div key={index}>
          {header}
          <FormTemplateSectionEdit key={index} section={section}
            includeName={formTemplate.sections.length > 1}
            onChange={formState.changeAt('sections', index)} />
        </div>
      );
    });

    return (
      <div>
        <fieldset className="form__fields">
          <FormField label="Form name">
            <input name="name" value={formTemplate.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          <FormField label="Form path">
            <input name="path" value={formTemplate.path || ''}
              onChange={formState.change('path')}/>
          </FormField>
          <FormField label="Submit button label">
            <input name="submitLabel"
              value={formTemplate.submitLabel || 'Submit'}
              onChange={formState.change('submitLabel')}/>
          </FormField>
        </fieldset>
        {sections}
        <fieldset>
          <FormField>
            <div className="form__tabs">
              <button type="button" onClick={formState.addTo('sections')}>
                Add section
              </button>
            </div>
          </FormField>
        </fieldset>
      </div>
    );
  }
};

FormTemplateFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
