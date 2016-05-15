"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import DateTime from '../../components/DateTime';
import EventDates from './EventDates';
import EventResources from './EventResources';

class EventFormFields extends Component {

  constructor () {
    super();
    this.state = { events: [] };
  }

  componentDidMount () {
    // this.refs.name.focus();
    getItems('events', { dates: { $gt: {} } })
    .then(response => this.setState({ events: response }));
  }

  render () {
    const { formState } = this.props;
    const event = formState.object;

    let primaryEvent;
    if (! event.dates || event.dates.length === 0) {
      let events = this.state.events.map(event => (
        <option key={event._id} label={event.name} value={event._id} />
      ));
      events.unshift(<option key={0} />);
      primaryEvent = (
        <FormField label="Primary event" help="For recurring event on-offs">
          <select name="primaryEventId" value={event.primaryEventId || ''}
            onChange={formState.change('primaryEventId')}>
            {events}
          </select>
        </FormField>
      );
    }

    return (
      <fieldset className="form__fields">
        <FormField label="Name">
          <input ref="name" name="name" value={event.name || ''}
            onChange={formState.change('name')}/>
        </FormField>
        <FormField label="Starts">
          <DateTime format="M/D/YYYY h:mm a" name="start" step={15}
            value={event.start || ''}
            onChange={formState.change('start')} />
        </FormField>
        <FormField label="Ends">
          <DateTime format="M/D/YYYY h:mm a" name="stop" step={15}
            value={event.stop || ''}
            onChange={formState.change('stop')} />
        </FormField>
        <FormField label="Location">
          <input name="location" value={event.location || ''}
            onChange={formState.change('location')}/>
        </FormField>
        <FormField label="Address">
          <input name="address" value={event.address || ''}
            onChange={formState.change('address')}/>
        </FormField>
        <FormField name="text" label="Text">
          <textarea ref="text" name="text" value={event.text || ''} rows={4}
            onChange={formState.change('text')}/>
        </FormField>
        <FormField label="Calendar">
          <input name="calendar" value={event.calendar || ''}
            onChange={formState.change('calendar')}/>
        </FormField>
        {primaryEvent}
      </fieldset>
    );
  }
}

EventFormFields.propTypes = {
  formState: PropTypes.object.isRequired
};

const VIEWS = {
  fields: EventFormFields,
  dates: EventDates,
  resources: EventResources
};

export default class EventFormContents extends Component {

  constructor () {
    super();
    this._onView = this._onView.bind(this);
    this.state = { view: 'fields' };
  }

  _onView (view) {
    this.setState({ view: view });
  }

  render () {
    const View = VIEWS[this.state.view];
    return (
      <div>
        <View formState={this.props.formState} />
        <div className="form__tabs">
          <button type="button" onClick={this._onView.bind(this, 'fields')}>
            Fields
          </button>
          <button type="button" onClick={this._onView.bind(this, 'resources')}>
            Resources
          </button>
          <button type="button" onClick={this._onView.bind(this, 'dates')}>
            Dates
          </button>
        </div>
      </div>
    );
  }
};

EventFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
