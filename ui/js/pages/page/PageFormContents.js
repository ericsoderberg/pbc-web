"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import AddIcon from '../../icons/Add';
import DownIcon from '../../icons/Down';
import UpIcon from '../../icons/Up';
import TrashIcon from '../../icons/Trash';
import TextSectionEdit from './TextSectionEdit';
import ImageSectionEdit from './ImageSectionEdit';
import EventSectionEdit from './EventSectionEdit';
import LibrarySectionEdit from './LibrarySectionEdit';
import UserSectionEdit from './UserSectionEdit';
import PagesSectionEdit from './PagesSectionEdit';
import VideoSectionEdit from './VideoSectionEdit';
import FormSectionEdit from './FormSectionEdit';

const SECTION_TYPES = ['text', 'image', 'event', 'library', 'user', 'pages',
  'video', 'form'];

const SECTIONS = {
  event: EventSectionEdit,
  form: FormSectionEdit,
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
    const { formState: { object: page } } = props;
    this.state = {
      expandAdd: (! page || ! page.sections || page.sections.length === 0),
      expandedSections: {}, // _id or id
      newSectionId: 1
    };
  }

  componentDidMount () {
    this.refs.name.focus();
  }

  componentWillReceiveProps (nextProps) {
    const { formState: { object: page } } = nextProps;
    this.setState({
      expandAdd: (! page || ! page.sections || page.sections.length === 0)
    });
  }

  _addSection (type) {
    return this.props.formState.addTo('sections', () => {
      const id = this.state.newSectionId;
      let expandedSections = { ...this.state.expandedSections };
      expandedSections[id] = true;
      this.setState({
        expandedSections: expandedSections,
        newSectionId: this.state.newSectionId + 1
      });
      return { type: type, id: id };
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
    const { expandedSections, expandAdd } = this.state;
    const page = formState.object;

    const sections = (page.sections || []).map((section, index) => {
      const Section = SECTIONS[section.type];

      const raise = (index === 0 ? undefined : (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('sections', index, index-1)}>
          <UpIcon />
        </button>
      ));
      const lower = (index === (page.sections.length - 1) ? undefined : (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('sections', index, index+1)}>
          <DownIcon />
        </button>
        ));

      let edit;
      if (expandedSections[section._id] || expandedSections[section.id]) {
        edit = (
          <Section section={section}
            onChange={formState.changeAt('sections', index)} />
        );
      }

      return (
        <div key={index}>
          <div className="form__fields-header">
            <h4 className="form__fields-header-label"
              onClick={this._toggleSection(section._id || section.id)}>
              {section.type}
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
          {edit}
        </div>
      );
    });

    let add;
    if (expandAdd) {

      const addControls = SECTION_TYPES.map(type => (
        <button key={type} type="button" className="button"
          onClick={this._addSection(type)}>
          {type}
        </button>
      ));

      add = (
        <fieldset className="form__fields"
          onClick={() => this.setState({ expandAdd: false })}>
          <FormField label="Add section">
            <div className="form__tabs">
              {addControls}
            </div>
          </FormField>
        </fieldset>
      );

    } else {

      add = (
        <div className="form__fields-header">
          <button type="button" className="button-icon"
            onClick={() => this.setState({ expandAdd: true })}>
            <AddIcon />
          </button>
        </div>
      );

    }

    return (
      <div>
        <fieldset className="form__fields">
          <FormField name="name" label="Name">
            <input ref="name" name="name" value={page.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          <FormField name="path" label="Path" help="unique url name">
            <input name="path" value={page.path || ''}
              onChange={formState.change('path')}/>
          </FormField>
        </fieldset>
        {sections}
        {add}
      </div>
    );
  }
};

PageFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
