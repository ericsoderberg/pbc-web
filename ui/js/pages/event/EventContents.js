"use strict";
import React, { PropTypes } from 'react';
import moment from 'moment';
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
    text = (
      <Section full={false}>
        <Text text={event.text} />
      </Section>
    );
  }

  let map;
  if (event.address) {
    map = (
      <div className="event-summary__map">
        <Map address={event.address} title={event.location} plain={true} />
      </div>
    );
  }

  let upcoming;
  let now = moment();
  const upcomingDates = (event.dates || []).sort().map(date => moment(date))
  .filter(date => date.isAfter(now)).slice(0, 3)
  .map(date => (
    <li key={date} className="item">{date.format('MMMM Do YYYY')}</li>
  ));
  if (upcomingDates.length > 0) {
    upcoming = (
      <Section full={false}>
        <div>
          <h3>Upcoming</h3>
          <ul className="list">
            {upcomingDates}
          </ul>
        </div>
      </Section>
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
      {upcoming}
      <PageContext
        filter={event ? { 'sections.eventId': event._id } : undefined} />
    </div>
  );
};

EventContents.PropTypes = {
  item: PropTypes.object.isRequired
};

export default EventContents;
