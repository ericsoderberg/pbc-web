"use strict";
import React, { PropTypes } from 'react';
import EventTimes from '../../components/EventTimes';
import Text from '../../components/Text';
import Map from '../../components/Map';

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
      {text}
      <div className="section__container">
        <div className="text section">
          <EventTimes event={event} reverse={true} />
        </div>
      </div>
      {map}
    </div>
  );
};

EventContents.PropTypes = {
  item: PropTypes.object.isRequired
};

export default EventContents;
