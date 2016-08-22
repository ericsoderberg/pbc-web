"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import DateTime from '../../components/DateTime';

export default class NewsletterFormContents extends Component {

  constructor () {
    super();
    this.state = { libraries: [], calendars: [], domains: [] };
  }

  componentDidMount () {
    const { formState, session } = this.props;

    getItems('messages', { distinct: 'library' })
    .then(libraries => this.setState({ libraries: libraries }))
    .catch(error => console.log('!!! NewsletterFormContents libraries catch', error));

    getItems('events', { distinct: 'calendar' })
    .then(calendars => this.setState({ calendars: calendars }))
    .catch(error => console.log('!!! NewsletterFormContents calendars catch', error));

    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.log('NewsletterFormContents domains catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  render () {
    const { formState, session } = this.props;
    const newsletter = formState.object;

    const libraries = this.state.libraries.map(library => (
      <option key={library} label={library} value={library} />
    ));
    libraries.unshift(<option key={0} />);

    const calendars = this.state.calendars.map(calendar => (
      <option key={calendar} label={calendar} value={calendar} />
    ));
    calendars.unshift(<option key={0} />);

    let administeredBy;
    if (session.administrator) {
      let domains = this.state.domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domains.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={newsletter.domainId || ''}
            onChange={formState.change('domainId')}>
            {domains}
          </select>
        </FormField>
      );
    }

    return (
      <fieldset className="form__fields">
        <FormField label="Name">
          <input name="name" value={newsletter.name || ''}
            onChange={formState.change('name')}/>
        </FormField>
        <FormField label="Date">
          <DateTime format="M/D/YYYY" name="date"
            value={newsletter.date || ''}
            onChange={formState.change('date')} />
        </FormField>
        <FormField label="Text">
          <textarea name="text" value={newsletter.text || ''} rows={4}
            onChange={formState.change('text')}/>
        </FormField>
        <FormField label="Library">
          <select name="library" value={newsletter.library || ''}
            onChange={formState.change('library')}>
            {libraries}
          </select>
        </FormField>
        <FormField label="Calendar">
          <select name="calendar" value={newsletter.calendar || ''}
            onChange={formState.change('calendar')}>
            {calendars}
          </select>
        </FormField>
        <FormField label="Address">
          <input name="address" value={newsletter.address || ''}
            onChange={formState.change('address')}/>
        </FormField>
        {administeredBy}
      </fieldset>
    );
  }
};

NewsletterFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
