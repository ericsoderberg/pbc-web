"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
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
      domains: [],
      expandAdd: (! page || ! page.sections || page.sections.length === 0),
      expandedSections: {}, // _id or id
      newSectionId: 1
    };
  }

  componentDidMount () {
    const { formState, session } = this.props;
    this.refs.name.focus();
    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.log('PageFormContents catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
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
    const { formState, session } = this.props;
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
          <div type="button" className="form-item">
            <button type="button" className="button-plain"
              onClick={this._toggleSection(section._id || section.id)}>
              <h4>{section.type}</h4>
            </button>
            <div className="box--row">
              {raise}
              {lower}
              <button type="button" className="button-icon"
                onClick={formState.removeAt('sections', index)}>
                <TrashIcon />
              </button>
            </div>
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
        <div className="form-item">
          <button type="button" className="button-icon"
            onClick={() => this.setState({ expandAdd: true })}>
            <AddIcon />
          </button>
        </div>
      );

    }

    let administeredBy;
    if (session.administrator) {
      let domains = this.state.domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domains.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={page.domainId || ''}
            onChange={formState.change('domainId')}>
            {domains}
          </select>
        </FormField>
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
          {administeredBy}
        </fieldset>
        {sections}
        {add}
      </div>
    );
  }
};

PageFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
