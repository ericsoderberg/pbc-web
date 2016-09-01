"use strict";
import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import Button from '../../components/Button';
import DateTime from '../../components/DateTime';
import SelectSearch from '../../components/SelectSearch';
import TrashIcon from '../../icons/Trash';

const Suggestion = (props) => (
  <div className="box--between">
    <span>{props.item.name}</span>
    <span className="secondary">
      {moment(props.item.start).format('MMM Do YYYY')}
    </span>
  </div>
);

export default class EventDetails extends Component {

  constructor () {
    super();
    this._onStartChange = this._onStartChange.bind(this);
    this._otherTimeChange = this._otherTimeChange.bind(this);
    this.state = { domains: [] };
  }

  componentDidMount () {
    const { formState, session } = this.props;

    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.log('EventFormContents catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
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
    const { formState, session } = this.props;
    const event = formState.object;

    let primaryEvent;
    if (! event.dates || event.dates.length === 0) {
      primaryEvent = (
        <FormField label="Primary event" help="For recurring event one-offs">
          <SelectSearch category="events"
            options={{select: 'name start', sort: '-start'}}
            Suggestion={Suggestion}
            value={(event.primaryEventId || {}).name || ''}
            onChange={(suggestion) =>
              formState.change('primaryEventId')({
                _id: suggestion._id, name: suggestion.name })} />
        </FormField>
      );
    }

    let otherTimes;
    if (event.times && event.times.length > 0) {
      otherTimes = event.times.map((time, index) => [
        <FormField key={`start-${index}`} label="Also starts"
          closeControl={
            <button type="button" className="button-icon"
              onClick={formState.removeAt('times', index)}>
              <TrashIcon secondary={true} />
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

    let administeredBy;
    if (session.administrator) {
      let domains = this.state.domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domains.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={event.domainId || ''}
            onChange={formState.change('domainId')}>
            {domains}
          </select>
        </FormField>
      );
    }

    return (
      <div>
        <fieldset key="main" className="form__fields">
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
          {administeredBy}
          {primaryEvent}
        </fieldset>
        <fieldset className="form__fields">
          {otherTimes}
          <FormFieldAdd>
            <Button label="Add another time" secondary={true}
              onClick={formState.addTo('times',
                { start: event.start, end: event.end })} />
          </FormFieldAdd>
        </fieldset>
      </div>
    );
  }
}

EventDetails.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
