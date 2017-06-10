import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import FormField from '../../components/FormField';
import DateTimeInput from '../../components/DateTimeInput';
import DateInput from '../../components/DateInput';
import SectionsFormContents from '../../components/SectionsFormContents';
import EventDates from './EventDates';
import EventDetails from './EventDetails';
import EventResources from './EventResources';

const SECTION_TYPES = [
  'text', 'map', 'image', 'people', 'video', 'form', 'files', 'library',
];

export default class EventFormContents extends Component {

  constructor() {
    super();
    this._onStartChange = this._onStartChange.bind(this);
  }

  _onStartChange(start) {
    const { formState } = this.props;
    const event = formState.object;
    const props = {};
    // Set end date to match if unset or earlier
    if (moment.isMoment(start)) {
      if (!event.end || start.isAfter(event.end)) {
        props.end = moment(start).add(1, 'hour').toISOString();
      }
    }
    props.start = start;
    formState.set(props);
  }

  render() {
    const { className, errors, formState, session } = this.props;
    const event = formState.object;

    const WhenInput = !event.allDay ? DateTimeInput : DateInput;

    const eventDates = moment(event.start).isSame(event.end, 'day') ?
      <EventDates formState={formState} session={session} /> : null;

    return (
      <div className={className}>

        <fieldset className="form__fields">
          <FormField label="Name" error={errors.name}>
            <input name="name"
              value={event.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField>
            <input name="allDay"
              type="checkbox"
              checked={event.allDay || false}
              onChange={formState.toggle('allDay')} />
            <label htmlFor="allDay">All day</label>
          </FormField>
          <FormField label="Starts" error={errors.start}>
            <WhenInput value={event.start || ''}
              onChange={this._onStartChange} />
          </FormField>
          <FormField label="Ends" error={errors.end}>
            <WhenInput value={event.end || ''}
              onChange={formState.change('end')} />
          </FormField>
          <FormField label="Location" error={errors.location}>
            <input name="location"
              value={event.location || ''}
              onChange={formState.change('location')} />
          </FormField>
        </fieldset>

        <SectionsFormContents formState={formState} types={SECTION_TYPES} />

        <EventDetails formState={formState}
          session={session}
          errors={errors} />
        <EventResources formState={formState} session={session} />
        {eventDates}
      </div>
    );
  }
}

EventFormContents.propTypes = {
  className: PropTypes.string,
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

EventFormContents.defaultProps = {
  className: undefined,
  errors: {},
};
