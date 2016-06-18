"use strict";
import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import DateTime from '../../components/DateTime';
import EventDates from './EventDates';
import EventResources from './EventResources';

class EventFormFields extends Component {

  constructor () {
    super();
    this._onStartChange = this._onStartChange.bind(this);
    this._otherTimeChange = this._otherTimeChange.bind(this);
    this.state = { events: [] };
  }

  componentDidMount () {
    // this.refs.name.focus();
    getItems('events', { dates: { $gt: {} } })
    .then(response => this.setState({ events: response }))
    .catch(error => console.log('EventFormFields catch', error));
  }

  _onStartChange (start) {
    const { formState } = this.props;
    const event = formState.object;
    let props = {};
    // Set end date to match if unset or earlier
    if (moment.isMoment(start)) {
      if (! event.end || start.isAfter(event.end)) {
        props.end = moment(start).add(1, 'hour').toISOString();
      }
      start = start.toISOString();
    }
    props.start = start;
    formState.set(props);
  }

  _otherTimeChange (field, index) {
    return (value) => {
      const { formState } = this.props;
      const event = formState.object;
      let times = event.times.splice(0);
      times[index][field] = value;
      formState.set('times', times);
    };
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
        <FormField label="Primary event" help="For recurring event one-offs">
          <select name="primaryEventId" value={event.primaryEventId || ''}
            onChange={formState.change('primaryEventId')}>
            {events}
          </select>
        </FormField>
      );
    }

    let otherTimes;
    if (event.times && event.times.length > 0) {
      otherTimes = event.times.map((time, index) => [
        <FormField key={`start-${index}`} label="Also starts"
          help={
            <button type="button" className="button--link"
              onClick={formState.removeAt('times', index)}>
              Remove
            </button>
          }>
          <DateTime format="h:mm a" name={`start-${index}`} step={15}
            value={time.start || ''}
            onChange={this._otherTimeChange('start', index)} />
        </FormField>,
        <FormField key={`end-${index}`} label="Also ends">
          <DateTime format="h:mm a" name={`end-${index}`} step={15}
            value={time.end || ''}
            onChange={this._otherTimeChange('end', index)} />
        </FormField>
      ]);
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
            onChange={this._onStartChange} />
        </FormField>
        <FormField label="Ends">
          <DateTime format="M/D/YYYY h:mm a" name="end" step={15}
            value={event.end || ''}
            onChange={formState.change('end')} />
        </FormField>
        <FormField label="Location">
          <input name="location" value={event.location || ''}
            onChange={formState.change('location')}/>
        </FormField>
        <FormField label="Address">
          <input name="address" value={event.address || ''}
            onChange={formState.change('address')}/>
        </FormField>
        <FormField label="Text">
          <textarea ref="text" name="text" value={event.text || ''} rows={4}
            onChange={formState.change('text')}/>
        </FormField>
        <FormField label="Calendar">
          <input name="calendar" value={event.calendar || ''}
            onChange={formState.change('calendar')}/>
        </FormField>
        <FormField label="Path" help="unique url name">
          <input name="path" value={event.path || ''}
            onChange={formState.change('path')}/>
        </FormField>
        {primaryEvent}
        {otherTimes}
        <FormField>
          <div className="form__tabs">
            <button type="button" className="button button--secondary"
              onClick={formState.addTo('times',
                { start: event.start, end: event.end })}>
              Add other time
            </button>
          </div>
        </FormField>
      </fieldset>
    );
  }
}

EventFormFields.propTypes = {
  formState: PropTypes.object.isRequired
};

const VIEWS = {
  details: EventFormFields,
  dates: EventDates,
  resources: EventResources
};

export default class EventFormContents extends Component {

  constructor () {
    super();
    this._onView = this._onView.bind(this);
    this.state = { view: 'details' };
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
          <button type="button"className="button button--secondary"
            onClick={this._onView.bind(this, 'details')}>
            Details
          </button>
          <button type="button" className="button button--secondary"
            onClick={this._onView.bind(this, 'resources')}>
            Resources
          </button>
          <button type="button" className="button button--secondary"
            onClick={this._onView.bind(this, 'dates')}>
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
