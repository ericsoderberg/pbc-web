"use strict";
import React, { Component, PropTypes } from 'react';
import EventDates from './EventDates';
import EventDetails from './EventDetails';
import EventResources from './EventResources';

export default class EventFormContents extends Component {

  render () {
    const { className, formState, session } = this.props;
    return (
      <div className={className}>
        <EventDetails formState={formState} session={session} />
        <EventResources formState={formState} session={session} />
        <EventDates formState={formState} session={session} />
      </div>
    );
  }
};

EventFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
