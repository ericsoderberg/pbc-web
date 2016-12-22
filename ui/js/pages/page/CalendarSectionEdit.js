"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';
import SectionEdit from './SectionEdit';

export default class CalendarSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange), calendars: [] };
  }

  componentDidMount () {
    getItems('calendars', { sort: 'name' })
    .then(calendars => this.setState({ calendars }))
    .catch(error => console.log('CalendarSectionEdit catch', error));
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange)
    });
  }

  render () {
    const { formState } = this.state;
    const section = formState.object;

    const calendarOptions = this.state.calendars.map(calendar => (
      <option key={calendar._id} label={calendar.name} value={calendar._id} />
    ));
    const value = (typeof section.calendarId === 'object' ?
      section.calendarId._id : section.calendarId) || '';

    return (
      <SectionEdit formState={formState}>
        <FormField label="Calendar">
          <select name="calendarId" value={value}
            onChange={formState.change('calendarId')}>
            {calendarOptions}
          </select>
        </FormField>
      </SectionEdit>
    );
  }
};

CalendarSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
