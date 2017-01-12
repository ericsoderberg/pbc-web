"use strict";
import React, { PropTypes } from 'react';
import Section from '../../components/Section';
import EventTimes from '../../components/EventTimes';
import Text from '../../components/Text';
import Image from '../../components/Image';
import Map from '../../components/Map';
import PageContext from '../page/PageContext';

const EventContents = (props) => {
  const event = props.item;

  let image;
  if (event.image) {
    image = (
      <Image image={event.image} full={true} />
    );
  }

  let location;
  if (event.location) {
    location = (
      <div className="event-summary__location">{event.location}</div>
    );
  }

  let text;
  if (event.text) {
    text = <Text text={event.text} />;
  }

  let map;
  if (event.address) {
    map = (
      <div className="event-summary__map">
        <Map address={event.address} title={event.location} plain={true} />
      </div>
    );
  }

  return (
    <div>
      {image}
      <Section full={false}>
        <div className="event-summary">
          <div className="event-summary__summary">
            <h1>{event.name}</h1>
            <EventTimes event={event} reverse={true} size="large" />
            {location}
          </div>
          <div className="event__map">
            {map}
          </div>
        </div>
      </Section>
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
