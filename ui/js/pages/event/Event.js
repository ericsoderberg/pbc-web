"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { getItem } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import EventContents from './EventContents';

const DATE_FORMAT = 'YYYY-MM-DD';

class Event extends Component {

  componentDidMount () {
    if (! this.props.event) {
      getItem('events', this.props.params.id, { cache: true, populate: true })
      .catch(error => console.log('!!! Event catch', error));
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.id !== this.props.params.id &&
      ! nextProps.event) {
      getItem('events', nextProps.params.id, { cache: true, populate: true })
      .catch(error => console.log('!!! Event catch', error));
    }
  }

  render () {
    const { event } = this.props;

    let actions;
    let contents;
    if (event) {
      contents = <EventContents item={event} />;
      const calendar = event.calendarId || {};
      const path = ((calendar.path || calendar._id) ?
        `/calendars/${calendar.path || calendar._id}` : `/calendar`) +
        // TODO: pick date via shared function with EventTimes
        `?focus=${encodeURIComponent(moment(event.start).format(DATE_FORMAT))}`;
      actions = (
        <Link to={path} className="a-header">Calendar</Link>
      );
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <ItemHeader category="events" item={event} actions={actions} />
        {contents}
      </main>
    );
  }
};

Event.propTypes = {
  event: PropTypes.object,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};

const select = (state, props) => {
  let event;
  if (state.events) {
    event = state.events[props.params.id];
  }
  return { event };
};

export default Stored(Event, select);
