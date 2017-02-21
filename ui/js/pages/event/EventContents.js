"use strict";
import React, { PropTypes } from 'react';
import moment from 'moment';
import Section from '../../components/Section';
import Text from '../../components/Text';
import Map from '../../components/Map';
import FormSummary from '../form/FormSummary';
import EventSummary from './EventSummary';

const EventContents = (props) => {
  const event = props.item;

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

  let form;
  if (event.formTemplateId) {
    form = (
      <Section align='left'>
        <FormSummary formTemplateId={event.formTemplateId} />
      </Section>
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
      <Section full={false} align='start' backgroundImage={event.image}>
        <EventSummary id={event} navigable={false} />
      </Section>
      {text}
      {map}
      {form}
      {upcoming}
    </div>
  );
};

EventContents.PropTypes = {
  item: PropTypes.object.isRequired
};

export default EventContents;
