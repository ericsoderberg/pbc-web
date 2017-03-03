"use strict";
import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import Button from '../../components/Button';
import DateTimeInput from '../../components/DateTimeInput';
import SelectSearch from '../../components/SelectSearch';
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
    this._onToggle = this._onToggle.bind(this);
    this._otherTimeChange = this._otherTimeChange.bind(this);
    this._onChangePrimaryEvent = this._onChangePrimaryEvent.bind(this);
    this.state = { active: false, domains: [], calendars: [] };
  }

  componentDidMount () {
    const { formState, session } = this.props;
    const params = getLocationParams();
    if (params.calendarId) {
      formState.change('calendarId')(params.calendarId);
    }
    if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  _get () {
    const { session } = this.props;

    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(domains => this.setState({ domains: domains }))
      .catch(error => console.log('EventDetails catch', error));
    }

    getItems('calendars', { sort: 'name' })
    .then(calendars => this.setState({ calendars: calendars }))
    .catch(error => console.log('EventDetails calendars catch', error));
  }

  _onToggle () {
    const { calendars } = this.state;
    const active = ! this.state.active;
    if (active && calendars.length === 0) {
      this._get();
    }
    this.setState({ active: ! this.state.active });
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
    const { active, calendars, domains } = this.state;
    const event = formState.object;

    let contents;
    if (active) {
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

      contents = (
        <fieldset className="form__fields">
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
          {otherTimes}
          <FormFieldAdd>
            <Button label="Add another time" secondary={true}
              onClick={formState.addTo('times',
                { start: event.start, end: event.end })} />
          </FormFieldAdd>
        </fieldset>
      );
    }

    return (
      <div>
        <div type="button" className="form-item">
          <Button secondary={true} label="Details"
            onClick={this._onToggle} />
        </div>
        {contents}
      </div>
    );
  }
}

EventDetails.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
