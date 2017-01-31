"use strict";
import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import Button from '../../components/Button';
import DateTimeInput from '../../components/DateTimeInput';
import SelectSearch from '../../components/SelectSearch';
import ImageField from '../../components/ImageField';
import TrashIcon from '../../icons/Trash';
import { getLocationParams } from '../../utils/Params';

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
    this._onChangePrimaryEvent = this._onChangePrimaryEvent.bind(this);
    this.state = { domains: [], calendars: [] };
  }

  componentDidMount () {
    const { formState, session } = this.props;

    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(domains => this.setState({ domains: domains }))
      .catch(error => console.log('EventFormContents catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }

    getItems('calendars', { sort: 'name' })
    .then(calendars => this.setState({ calendars: calendars }))
    .catch(error => console.log('EventFormContents calendars catch', error));

    const params = getLocationParams();
    if (params.calendarId) {
      this.props.formState.change('calendarId')(params.calendarId);
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

  _onChangePrimaryEvent (suggestion) {
    const { formState } = this.props;
    let value;
    if (suggestion) {
      value = { _id: suggestion._id, name: suggestion.name };
    } else {
      value = undefined;
    }
    formState.set('primaryEventId', value);
  }

  render () {
    const { formState, session } = this.props;
    const { calendars, domains } = this.state;
    const event = formState.object;

    let primaryEvent;
    if (! event.dates || event.dates.length === 0) {
      primaryEvent = (
        <FormField label="Primary event" help="For recurring event one-offs">
          <SelectSearch category="events"
            options={{select: 'name start', sort: '-start'}}
            Suggestion={Suggestion} clearable={true}
            value={(event.primaryEventId || {}).name || ''}
            onChange={this._onChangePrimaryEvent} />
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
          <DateTimeInput value={time.start || ''}
            onChange={this._otherTimeChange('start', index)} />
        </FormField>,
        <FormField key={`end-${index}`} label="Also ends">
          <DateTimeInput value={time.end || ''}
            onChange={this._otherTimeChange('end', index)} />
        </FormField>
      ]);
    }

    let administeredBy;
    if (session.administrator) {
      let domainOptions = domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domainOptions.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={event.domainId || ''}
            onChange={formState.change('domainId')}>
            {domainOptions}
          </select>
        </FormField>
      );
    }

    let calendarOptions = calendars.map(calendar => (
      <option key={calendar._id} label={calendar.name} value={calendar._id} />
    ));
    calendarOptions.unshift(<option key={0} />);

    return (
      <div>
        <fieldset key="main" className="form__fields">
          <FormField label="Name">
            <input ref="name" name="name" value={event.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          <FormField label="Starts">
            <DateTimeInput value={event.start || ''}
              onChange={this._onStartChange} />
          </FormField>
          <FormField label="Ends">
            <DateTimeInput value={event.end || ''}
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
          <ImageField label="Image" name="image"
            formState={formState} property="image" />
          <FormField name="formTemplateId" label="Form template">
            <SelectSearch category="form-templates" clearable={true}
              value={(event.formTemplateId || {}).name || ''}
              onChange={(suggestion) => {
                if (suggestion) {
                  formState.change('formTemplateId')({
                    _id: suggestion._id, name: suggestion.name });
                } else {
                  formState.set('formTemplateId', undefined);
                }
              }} />
          </FormField>

          <FormField label="Calendar">
            <select name="calendarId"
              value={(event.calendarId || {})._id || event.calendarId || ''}
              onChange={formState.change('calendarId')}>
              {calendarOptions}
            </select>
          </FormField>
          <FormField label="Path" help="unique url name">
            <input name="path" value={event.path || ''}
              onChange={formState.change('path')}/>
          </FormField>
          <FormField>
            <input name="public" type="checkbox"
              checked={event.public || false}
              onChange={formState.toggle('public')}/>
            <label htmlFor="public">public</label>
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
