"use strict";
import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import FormField from '../../components/FormField';
import SelectSearch from '../../components/SelectSearch';
import FormState from '../../utils/FormState';
import SectionFields from './SectionFields';

const Suggestion = (props) => (
  <div className="box--between">
    <span>{props.item.name}</span>
    <span className="secondary">
      {moment(props.item.start).format('MMM YYYY')}
    </span>
  </div>
);

export default class EventSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange)
    });
  }

  render () {
    const { formState } = this.state;
    const section = formState.object;

    return (
      <fieldset className="form__fields">
        <FormField label="Event">
          <SelectSearch category="events"
            options={{select: 'name start', sort: '-start'}}
            Suggestion={Suggestion}
            value={section.eventId.name || ''}
            onChange={(suggestion) =>
              formState.change('eventId')({
                _id: suggestion._id, name: suggestion.name })} />
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
