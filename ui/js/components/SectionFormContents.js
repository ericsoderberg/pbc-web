import React, { Component, PropTypes } from 'react';
import DownIcon from '../icons/DownArrow';
import UpIcon from '../icons/UpArrow';
import BlankIcon from '../icons/Blank';
import TrashIcon from '../icons/Trash';
import TextSectionEdit from './TextSectionEdit';
import ImageSectionEdit from './ImageSectionEdit';
import CalendarSectionEdit from '../pages/calendar/CalendarSectionEdit';
import EventSectionEdit from '../pages/event/EventSectionEdit';
import FilesSectionEdit from '../pages/file/FilesSectionEdit';
import LibrarySectionEdit from '../pages/library/LibrarySectionEdit';
import PeopleSectionEdit from '../pages/user/PeopleSectionEdit';
import PagesSectionEdit from '../pages/page/PagesSectionEdit';
import VideoSectionEdit from './VideoSectionEdit';
import FormSectionEdit from '../pages/form/FormSectionEdit';
import MapSectionEdit from './MapSectionEdit';
import DonateSectionEdit from './DonateSectionEdit';

const SECTIONS = {
  calendar: CalendarSectionEdit,
  donate: DonateSectionEdit,
  event: EventSectionEdit,
  files: FilesSectionEdit,
  form: FormSectionEdit,
  image: ImageSectionEdit,
  library: LibrarySectionEdit,
  map: MapSectionEdit,
  pages: PagesSectionEdit,
  text: TextSectionEdit,
  people: PeopleSectionEdit,
  video: VideoSectionEdit,
};

export default class SectionFormContents extends Component {

  constructor() {
    super();
    this._onToggle = this._onToggle.bind(this);
    this.state = {};
  }

  _onToggle() {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    const { formState, index } = this.props;
    const { expanded } = this.state;
    const item = formState.object;
    const section = item.sections[index];

    const Section = SECTIONS[section.type];

    let raise;
    if (index > 0) {
      raise = (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('sections', index, index - 1)}>
          <UpIcon />
        </button>
      );
    }

    let lower;
    if (index < (item.sections.length - 1)) {
      lower = (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('sections', index, index + 1)}>
          <DownIcon />
        </button>
      );
    } else {
      lower = (
        <button type="button" className="button-icon">
          <BlankIcon />
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
        <div type="button" className="form-item form-item__controls">
          <button type="button" className="button-plain form-item__control"
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
}

SectionFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};
