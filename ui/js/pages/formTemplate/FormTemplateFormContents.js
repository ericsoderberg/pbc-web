"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import DownIcon from '../../icons/Down';
import UpIcon from '../../icons/Up';
import TrashIcon from '../../icons/Trash';
import FormTemplateSectionEdit from './FormTemplateSectionEdit';

export default class FormTemplateFormContents extends Component {

  constructor () {
    super();
    this.state = {
      expandedSections: {}, // _id or id
      newSectionId: 1
    };
  }

  _addSection () {
    return this.props.formState.addTo('sections', () => {
      const id = this.state.newSectionId;
      let expandedSections = { ...this.state.expandedSections };
      expandedSections[id] = true;
      this.setState({
        expandedSections: expandedSections,
        newSectionId: this.state.newSectionId + 1
      });
      return { id: id };
    });
  }

  _toggleSection (id) {
    return () => {
      let expandedSections = { ...this.state.expandedSections };
      expandedSections[id] = ! expandedSections[id];
      this.setState({ expandedSections: expandedSections });
    };
  }

  render () {
    const { formState } = this.props;
    const { expandedSections } = this.state;
    const formTemplate = formState.object;

    const sections = (formTemplate.sections || []).map((section, index) => {

      const raise = (index === 0 ? undefined : (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('sections', index, index-1)}>
          <UpIcon />
        </button>
      ));
      const lower = (index === (formTemplate.sections.length - 1) ? undefined : (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('sections', index, index+1)}>
          <DownIcon />
        </button>
        ));

      let header;
      if (formTemplate.sections.length > 1) {
        header = (
          <div className="form__fields-header">
            <h4 className="form__fields-header-label"
              onClick={this._toggleSection(section._id || section.id)}>
              {section.name || `Section ${index + 1}`}
            </h4>
            <span className="form__fields-header-actions">
              {raise}
              {lower}
              <button type="button" className="button-icon"
                onClick={formState.removeAt('sections', index)}>
                <TrashIcon />
              </button>
            </span>
          </div>
        );
      }

      let edit;
      if (! header || expandedSections[section._id] || expandedSections[section.id]) {
        edit = (
          <FormTemplateSectionEdit key={index} section={section}
            includeName={formTemplate.sections.length > 1}
            onChange={formState.changeAt('sections', index)} />
        );
      }

      return (
        <div key={index}>
          {header}
          {edit}
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
        <fieldset className="form__fields">
          <FormField>
            <div className="form__tabs">
              <button type="button" className="button button--secondary"
                onClick={this._addSection()}>
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
