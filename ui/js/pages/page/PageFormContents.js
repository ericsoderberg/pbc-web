"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import Button from '../../components/Button';
import PageFormSection from './PageFormSection';

const SECTION_TYPES = [
  'text', 'image', 'event', 'calendar', 'library',
  'people', 'pages', 'video', 'form', 'files'
];

export default class PageFormContents extends Component {

  constructor (props) {
    super(props);
    this.state = { domains: [], newSectionId: 1 };
  }

  componentDidMount () {
    const { formState, session } = this.props;
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
      this.setState({ newSectionId: this.state.newSectionId + 1 });
      return { type: type, id: id };
    });
  }

  render () {
    const { formState, session } = this.props;
    const page = formState.object;

    const sections = (page.sections || []).map((section, index) => (
      <PageFormSection key={index} formState={formState} section={section}
        index={index} />
    ));

    const addControls = SECTION_TYPES.map(type => (
      <Button key={type} label={`Add ${type}`} secondary={true}
        onClick={this._addSection(type)} />
    ));

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
            <input name="name" value={page.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          <FormField name="path" label="Path" help="unique url name">
            <input name="path" value={page.path || ''}
              onChange={formState.change('path')}/>
          </FormField>
          {administeredBy}
        </fieldset>
        {sections}
        <FormFieldAdd>
          {addControls}
        </FormFieldAdd>
      </div>
    );
  }
};

PageFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
