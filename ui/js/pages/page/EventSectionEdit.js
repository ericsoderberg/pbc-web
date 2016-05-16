"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';

export default class EventSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange), events: [] };
  }

  componentDidMount () {
    getItems('events')
    .then(response => this.setState({ events: response }));
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange)
    });
  }

  render () {
    const { formState } = this.state;
    const section = formState.object;

    const events = this.state.events.map(event => (
      <option key={event._id} label={event.name} value={event._id} />
    ));
    events.unshift(<option key={0} />);

    return (
      <fieldset className="form__fields">
        <FormField name="event" label="Event">
          <select name="objectId" value={section.objectId || ''}
            onChange={formState.change('objectId')}>
            {events}
          </select>
        </FormField>
        <FormField>
          <input name="full" type="checkbox"
            checked={section.full || false}
            onChange={formState.toggle('full')}/>
          <label htmlFor="full">Edge to edge</label>
        </FormField>
      </fieldset>
    );
  }
};

EventSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
