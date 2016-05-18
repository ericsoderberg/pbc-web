"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import TextSectionEdit from './TextSectionEdit';
import ImageSectionEdit from './ImageSectionEdit';
import EventSectionEdit from './EventSectionEdit';
import LibrarySectionEdit from './LibrarySectionEdit';
import UserSectionEdit from './UserSectionEdit';
import PagesSectionEdit from './PagesSectionEdit';

const SECTIONS = {
  event: EventSectionEdit,
  image: ImageSectionEdit,
  library: LibrarySectionEdit,
  pages: PagesSectionEdit,
  text: TextSectionEdit,
  user: UserSectionEdit
};

export default class PageFormContents extends Component {

  constructor (props) {
    super(props);
    this._onAddSection = this._onAddSection.bind(this);
    this._onChangeSection = this._onChangeSection.bind(this);
    this._onSwapSection = this._onSwapSection.bind(this);
    this._onRemoveSection = this._onRemoveSection.bind(this);
  }

  componentDidMount () {
    this.refs.name.focus();
  }

  _onAddSection (type) {
    const { formState } = this.props;
    let sections = (formState.object.sections || []).slice(0);
    sections.push({ type: type });
    formState.change('sections')(sections);
  }

  _onChangeSection (section, index) {
    const { formState } = this.props;
    let sections = formState.object.sections.slice(0);
    sections[index] = section;
    formState.change('sections')(sections);
  }

  _onSwapSection (section, index, nextIndex) {
    const { formState } = this.props;
    let sections = formState.object.sections.slice(0);
    sections[index] = sections[nextIndex];
    sections[nextIndex] = section;
    formState.change('sections')(sections);
  }

  _onRemoveSection (index) {
    const { formState } = this.props;
    let sections = formState.object.sections.slice(0);
    sections.splice(index, 1);
    formState.change('sections')(sections);
  }

  render () {
    const { formState } = this.props;
    const page = formState.object;

    const sections = (page.sections || []).map((section, index) => {
      const Section = SECTIONS[section.type];
      const raise = (index === 0 ? undefined : (
        <button type="button" onClick={
            this._onSwapSection.bind(this, section, index, index - 1)}>up</button>
      ));
      const lower = (index === (page.sections.length - 1) ? undefined : (
        <button type="button" onClick={
            this._onSwapSection.bind(this, section, index, index + 1)}>down</button>
        ));
      return (
        <div key={index}>
          <div className="form__fields-header">
            {raise}
            {lower}
            <button type="button" onClick={
                this._onRemoveSection.bind(this, index)}>remove</button>
          </div>
          <Section section={section}
            onChange={(nextSection) => this._onChangeSection(nextSection, index)} />
        </div>
      );
    });

    const addControls = ['text', 'image', 'event', 'library', 'user', 'pages'].map(type => (
      <button key={type} type="button" onClick={this._onAddSection.bind(this, type)}>
        {type}
      </button>
    ));

    return (
      <div>
        <fieldset className="form__fields">
          <FormField name="name" label="Name">
            <input ref="name" name="name" value={page.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          <FormField name="path" label="Path">
            <input name="path" value={page.path || ''}
              onChange={formState.change('path')}/>
          </FormField>
        </fieldset>
        {sections}
        <fieldset className="form__fields">
          <FormField label="Add section">
            <div className="form__tabs">
              {addControls}
            </div>
          </FormField>
        </fieldset>
      </div>
    );
  }
};

PageFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
