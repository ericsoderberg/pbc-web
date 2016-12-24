"use strict";
import React, { PropTypes } from 'react';
import EventTimes from '../../components/EventTimes';
import Text from '../../components/Text';
import Map from '../../components/Map';
import PageContext from '../page/PageContext';

const EventContents = (props) => {
  const event = props.item;

  let text;
  if (event.text) {
    text = <Text text={event.text} />;
  }

  let map;
  if (event.address) {
    map = <Map address={event.address} title={event.location} />;
  }

  return (
    <div>
      <div className="section__container">
        <div className="text section">
          <div>
            <h1>{event.name}</h1>
          </div>
          <EventTimes event={event} reverse={true} size="large" />
        </div>
      </div>
      {map}
      {text}
      <PageContext
        filter={event ? { 'sections.eventId': event._id } : undefined} />
    </div>
  );
};

EventContents.PropTypes = {
  item: PropTypes.object.isRequired
};

export default EventContents;
