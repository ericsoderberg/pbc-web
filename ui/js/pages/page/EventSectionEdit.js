"use strict";
import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import SelectSearch from '../../components/SelectSearch';
import FormState from '../../utils/FormState';
import SectionFields from './SectionFields';

export default class EventSectionEdit extends Component {

  constructor (props) {
    super(props);
    this._onSearch = this._onSearch.bind(this);
    const { section, onChange } = props;
    this.state = {
      formState: new FormState(section, onChange),
      events: [],
      searchText: ''
    };
  }

  componentDidMount () {
    this._get();
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange)
    });
  }

  _get (searchText) {
    clearTimeout(this._getTimer);
    this._getTimer = setTimeout(() => {
      getItems('events',
        { search: searchText, select: 'name start', sort: '-start' })
      .then(events => this.setState({ events: events }));
    }, 100);
  }

  _onSearch (searchText) {
    this.setState({ searchText: searchText });
    this._get(searchText);
  }

  render () {
    const { formState, events } = this.state;
    const section = formState.object;

    const suggestions = events.map(event => ({
      label: (
        <div className="box--between">
          <span>{event.name}</span>
          <span className="secondary">
            {moment(event.start).format('MMM YYYY')}
          </span>
        </div>
      ),
      name: event.name,
      id: event._id
    }));

    return (
      <fieldset className="form__fields">
        <FormField label="Event">
          <SelectSearch value={section.eventId.name || ''}
            onSearch={this._onSearch}
            onChange={(suggestion) =>
              formState.change('eventId')({
                _id: suggestion.id, name: suggestion.name })}
            suggestions={suggestions} />
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
