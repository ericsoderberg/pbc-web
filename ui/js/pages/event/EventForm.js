"use strict";
import React, { Component, PropTypes } from 'react';
import Form from '../../components/Form';
import FormField from '../../components/FormField';
import FormEvents from '../../utils/FormEvents';
import DateTime from '../../components/DateTime';

export default class EventForm extends Component {

  constructor (props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._setEvent = this._setEvent.bind(this);
    this._dateChange = this._dateChange.bind(this);
    this.state = {
      formEvents: new FormEvents(props.item, this._setEvent),
      event: props.item
    };
  }

  componentDidMount () {
    this.refs.name.focus();
  }

  componentWillReceiveProps (nextProps) {
    this._setEvent(nextProps.item);
  }

  _onSubmit () {
    this.props.onSubmit(this.state.event);
  }

  _setEvent (event) {
    this.state.formEvents.set(event);
    this.setState({ event: event});
  }

  _dateChange (propertyName) {
    return (value) => {
      let event = { ...this.state.event };
      event[propertyName] = value;
      this._setEvent(event);
    };
  }

  render () {
    const { title, action, submitLabel, onRemove, error } = this.props;
    const { event, formEvents } = this.state;

    return (
      <Form title={title} submitLabel={submitLabel} action={action}
        onSubmit={this._onSubmit} onRemove={onRemove} error={error}>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input ref="name" name="name" value={event.name || ''}
              onChange={formEvents.change('name')}/>
          </FormField>
          <FormField label="Starts">
            <DateTime format="M/D/YYYY h:mm a" name="start" step={15}
              value={event.start || ''}
              onChange={this._dateChange('start')} />
          </FormField>
          <FormField label="Ends">
            <DateTime format="M/D/YYYY h:mm a" name="stop" step={15}
              value={event.stop || ''}
              onChange={this._dateChange('stop')} />
          </FormField>
          <FormField label="Calendar">
            <input name="calendar" value={event.calendar || ''}
              onChange={formEvents.change('calendar')}/>
          </FormField>
          <FormField label="Location">
            <input name="location" value={event.location || ''}
              onChange={formEvents.change('location')}/>
          </FormField>
          <FormField name="text" label="Text">
            <textarea ref="text" name="text" value={event.text || ''} rows={4}
              onChange={formEvents.change('text')}/>
          </FormField>
        </fieldset>
      </Form>
    );
  }
};

EventForm.propTypes = {
  action: PropTypes.string,
  error: PropTypes.object,
  item: PropTypes.object.isRequired,
  onRemove: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

EventForm.contextTypes = {
  router: PropTypes.any
};
