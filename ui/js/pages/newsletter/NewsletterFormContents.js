"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import DateInput from '../../components/DateInput';

export default class NewsletterFormContents extends Component {

  constructor () {
    super();
    this.state = { libraries: [], calendars: [], domains: [] };
  }

  componentDidMount () {
    const { formState, session } = this.props;

    getItems('libraries', { sort: 'name' })
    .then(libraries => this.setState({ libraries: libraries }))
    .catch(error => console.log('NewsletterFormContents libraries catch',
      error));

    getItems('calendars', { sort: 'name' })
    .then(calendars => this.setState({ calendars: calendars }))
    .catch(error => console.log('NewsletterFormContents calendars catch',
      error));

    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(domains => this.setState({ domains: domains }))
      .catch(error => console.log('NewsletterFormContents domains catch',
        error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  render () {
    const { formState, session } = this.props;
    const { calendars, domains, libraries } = this.state;
    const newsletter = formState.object;

    let libraryOptions = libraries.map(library => (
      <option key={library._id} label={library.name} value={library._id} />
    ));
    libraryOptions.unshift(<option key={0} />);

    let calendarOptions = calendars.map(calendar => (
      <option key={calendar._id} label={calendar.name} value={calendar._id} />
    ));
    calendarOptions.unshift(<option key={0} />);

    let administeredBy;
    if (session.administrator) {
      let domainOptions = domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domainOptions.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={newsletter.domainId || ''}
            onChange={formState.change('domainId')}>
            {domainOptions}
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
          <DateInput value={newsletter.date || ''}
            onChange={formState.change('date')} />
        </FormField>
        <FormField label="Text">
          <textarea name="text" value={newsletter.text || ''} rows={4}
            onChange={formState.change('text')}/>
        </FormField>
        <FormField label="Library">
          <select name="libraryId" value={newsletter.libraryId || ''}
            onChange={formState.change('libraryId')}>
            {libraryOptions}
          </select>
        </FormField>
        <FormField label="Calendar">
          <select name="calendarId" value={newsletter.calendarId || ''}
            onChange={formState.change('calendarId')}>
            {calendarOptions}
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
