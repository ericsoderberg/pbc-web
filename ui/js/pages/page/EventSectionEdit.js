"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';
import SectionFields from './SectionFields';

export default class EventSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange), events: [] };
  }

  componentDidMount () {
    getItems('events')
    .then(events => this.setState({ events: events }));
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
        <FormField name="eventId" label="Event">
          <select name="eventId" value={section.eventId || ''}
            onChange={formState.change('eventId')}>
            {events}
          </select>
        </FormField>
        <FormField>
          <input name="navigable" type="checkbox"
            checked={(false === section.navigable ? section.navigable : true)}
            onChange={formState.toggle('navigable')}/>
          <label htmlFor="navigable">Navigable?</label>
        </FormField>
        <SectionFields formState={formState} />
      </fieldset>
    );
  }
};

EventSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
