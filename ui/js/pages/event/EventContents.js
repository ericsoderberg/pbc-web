"use strict";
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import EventTimes from '../../components/EventTimes';
import Text from '../../components/Text';
import Map from '../../components/Map';

const EventContents = (props) => {
  const event = props.item;

  let text, altText;
  if (event.text) {
    text = <Text text={event.text} />;
  } else {
    altText = (
      <div>
        <h1>{event.name}</h1>
      </div>
    );
  }

  let map;
  if (event.address) {
    map = <Map address={event.address} title={event.location} />;
  }

  const calendar = event.calendarId || {};
  const calendarLink = (
    <Link to={`/calendars/${calendar.path || calendar._id}`}>
      {calendar.name}
    </Link>
  );

  return (
    <div>
      {text}
      <div className="section__container">
        <div className="text section">
          {altText}
          <EventTimes event={event} reverse={true} size="large" />
        </div>
      </div>
      {map}
      <div className="section__container">
        <div className="text section">
          {calendarLink}
        </div>
      </div>
    </div>
  );
};

EventContents.PropTypes = {
  item: PropTypes.object.isRequired
};

export default EventContents;
