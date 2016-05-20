"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import TextSectionEdit from './TextSectionEdit';
import ImageSectionEdit from './ImageSectionEdit';
import EventSectionEdit from './EventSectionEdit';
import LibrarySectionEdit from './LibrarySectionEdit';
import UserSectionEdit from './UserSectionEdit';
import PagesSectionEdit from './PagesSectionEdit';
import VideoSectionEdit from './VideoSectionEdit';

const SECTIONS = {
  event: EventSectionEdit,
  image: ImageSectionEdit,
  library: LibrarySectionEdit,
  pages: PagesSectionEdit,
  text: TextSectionEdit,
  user: UserSectionEdit,
  video: VideoSectionEdit
};

export default class PageFormContents extends Component {

  constructor (props) {
    super(props);
  }

  componentDidMount () {
    this.refs.name.focus();
  }

  render () {
    const { formState } = this.props;
    const page = formState.object;

    const sections = (page.sections || []).map((section, index) => {
      const Section = SECTIONS[section.type];
      const raise = (index === 0 ? undefined : (
        <button type="button"
          onClick={formState.swapWith('fields', index, index-1)}>up</button>
      ));
      const lower = (index === (page.sections.length - 1) ? undefined : (
        <button type="button"
          onClick={formState.swapWith('fields', index, index+1)}>down</button>
        ));
      return (
        <div key={index}>
          <div className="form__fields-header">
            {raise}
            {lower}
            <button type="button"
              onClick={formState.removeAt('sections', index)}>remove</button>
          </div>
          <Section section={section}
            onChange={formState.changeAt('sections', index)} />
        </div>
      );
    });

    const addControls = ['text', 'image', 'event', 'library', 'user', 'pages', 'video'].map(type => (
      <button key={type} type="button"
        onClick={formState.addTo('sections', { type: type })}>
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
