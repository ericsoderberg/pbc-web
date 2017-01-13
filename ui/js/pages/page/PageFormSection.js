"use strict";
import React, { Component, PropTypes } from 'react';
import DownIcon from '../../icons/Down';
import UpIcon from '../../icons/Up';
import TrashIcon from '../../icons/Trash';
import TextSectionEdit from './TextSectionEdit';
import ImageSectionEdit from './ImageSectionEdit';
import CalendarSectionEdit from './CalendarSectionEdit';
import EventSectionEdit from './EventSectionEdit';
import FilesSectionEdit from './FilesSectionEdit';
import LibrarySectionEdit from './LibrarySectionEdit';
import PeopleSectionEdit from './PeopleSectionEdit';
import PagesSectionEdit from './PagesSectionEdit';
import VideoSectionEdit from './VideoSectionEdit';
import FormSectionEdit from './FormSectionEdit';

const SECTIONS = {
  calendar: CalendarSectionEdit,
  event: EventSectionEdit,
  files: FilesSectionEdit,
  form: FormSectionEdit,
  image: ImageSectionEdit,
  library: LibrarySectionEdit,
  pages: PagesSectionEdit,
  text: TextSectionEdit,
  people: PeopleSectionEdit,
  video: VideoSectionEdit
};

export default class PageFormSection extends Component {

  constructor () {
    super();
    this._onToggle = this._onToggle.bind(this);
    this.state = {};
  }

  _onToggle () {
    this.setState({ expanded: ! this.state.expanded });
  }

  render () {
    const { formState, index } = this.props;
    const { expanded } = this.state;
    const page = formState.object;
    const section = page.sections[index];

    const Section = SECTIONS[section.type];

    let raise;
    if (index > 0) {
      raise = (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('sections', index, index-1)}>
          <UpIcon />
        </button>
      );
    }

    let lower;
    if (index < (page.sections.length - 1)) {
      lower = (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('sections', index, index+1)}>
          <DownIcon />
        </button>
      );
    }

    let contents;
    if (expanded) {
      contents = (
        <Section section={section}
          onChange={formState.changeAt('sections', index)} />
      );
    }

    return (
      <div>
        <div type="button" className="form-item">
          <button type="button" className="button-plain form-item-control"
            onClick={this._onToggle}>
            <h3>{section.type}</h3>
          </button>
          <div className="box--row box--static">
            {raise}
            {lower}
            <button type="button" className="button-icon"
              onClick={formState.removeAt('sections', index)}>
              <TrashIcon />
            </button>
          </div>
        </div>
        {contents}
      </div>
    );
  }
};

PageFormSection.propTypes = {
  formState: PropTypes.object.isRequired,
  label: PropTypes.string
};
