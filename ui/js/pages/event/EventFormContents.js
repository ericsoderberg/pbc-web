"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import DateTime from '../../components/DateTime';

export default class EventFormContents extends Component {

  componentDidMount () {
    this.refs.name.focus();
  }

  render () {
    const { formState } = this.props;
    const event = formState.object;

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
        <FormField label="Calendar">
          <input name="calendar" value={event.calendar || ''}
            onChange={formState.change('calendar')}/>
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
      </fieldset>
    );
  }
};

EventFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
