"use strict";
import React, { PropTypes } from 'react';
import moment from 'moment';
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
      <div className="text__container">
        <div className="text">
          <h2>{moment(event.start).format('MMMM Do YYYY @ h:mm a')}</h2>
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
