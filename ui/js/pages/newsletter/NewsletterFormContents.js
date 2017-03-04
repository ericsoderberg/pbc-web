
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import DateInput from '../../components/DateInput';
import ImageField from '../../components/ImageField';
import SelectSearch from '../../components/SelectSearch';
import TrashIcon from '../../icons/Trash';

export default class NewsletterFormContents extends Component {

  constructor() {
    super();
    this._onAddEvent = this._onAddEvent.bind(this);
    this._changeEvent = this._changeEvent.bind(this);
    this._removeEvent = this._removeEvent.bind(this);
    this.state = { libraries: [], calendars: [], domains: [] };
  }

  componentDidMount() {
    const { formState, session } = this.props;

    getItems('libraries', { sort: 'name' })
    .then(libraries => this.setState({ libraries }))
    .catch(error => console.error('NewsletterFormContents libraries catch',
      error));

    getItems('calendars', { sort: 'name' })
    .then(calendars => this.setState({ calendars }))
    .catch(error => console.error('NewsletterFormContents calendars catch',
      error));

    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(domains => this.setState({ domains }))
      .catch(error => console.error('NewsletterFormContents domains catch',
        error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  _onAddEvent() {
    const newsletter = this.props.formState.object;
    const eventIds = (newsletter.eventIds || []).slice(0);
    eventIds.push({});
    this.props.formState.set('eventIds', eventIds);
  }

  _changeEvent(index) {
    return (suggestion) => {
      const newsletter = this.props.formState.object;
      const eventIds = (newsletter.eventIds || []).slice(0);
      eventIds[index] = { _id: suggestion._id, name: suggestion.name };
      this.props.formState.set('eventIds', eventIds);
    };
  }

  _removeEvent(index) {
    return () => {
      const newsletter = this.props.formState.object;
      const eventIds = (newsletter.eventIds || []).slice(0);
      eventIds.splice(index, 1);
      this.props.formState.set('eventIds', eventIds);
    };
  }

  render() {
    const { className, formState, session } = this.props;
    const { calendars, domains, libraries } = this.state;
    const newsletter = formState.object;

    const libraryOptions = libraries.map(library => (
      <option key={library._id} label={library.name} value={library._id} />
    ));
    libraryOptions.unshift(<option key={0} />);

    const calendarOptions = calendars.map(calendar => (
      <option key={calendar._id} label={calendar.name} value={calendar._id} />
    ));
    calendarOptions.unshift(<option key={0} />);

    let administeredBy;
    if (session.administrator) {
      const domainOptions = domains.map(domain => (
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

    const events = (newsletter.eventIds || []).map((eventId, index) => {
      const removeControl = (
        <button type="button" className="button-icon"
          onClick={this._removeEvent(index)}>
          <TrashIcon secondary={true} />
        </button>
      );
      return (
        <FormField key={eventId._id} label="Event" closeControl={removeControl}>
          <SelectSearch category="events" value={eventId.name || ''}
            onChange={this._changeEvent(index)} />
        </FormField>
      );
    });

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input name="name" value={newsletter.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField label="Date">
            <DateInput value={newsletter.date || ''}
              onChange={formState.change('date')} />
          </FormField>
          <ImageField label="Image" name="image"
            formState={formState} property="image" />
          <FormField label="Text">
            <textarea name="text" value={newsletter.text || ''} rows={4}
              onChange={formState.change('text')} />
          </FormField>
          <FormField label="Library">
            <select name="libraryId" value={newsletter.libraryId || ''}
              onChange={formState.change('libraryId')}>
              {libraryOptions}
            </select>
          </FormField>
          {events}
          <FormFieldAdd>
            <button type="button" className="button button--secondary"
              onClick={this._onAddEvent}>
              Add event
            </button>
          </FormFieldAdd>
        </fieldset>
        <fieldset className="form__fields">
          <FormField label="Address">
            <input name="address" value={newsletter.address || ''}
              onChange={formState.change('address')} />
          </FormField>
          {administeredBy}
        </fieldset>
      </div>
    );
  }
}

NewsletterFormContents.propTypes = {
  className: PropTypes.string,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

NewsletterFormContents.defaultProps = {
  className: undefined,
};
