
import React, { PropTypes } from 'react';
import moment from 'moment';
import Section from '../../components/Section';
import Text from '../../components/Text';
import Sections from '../../components/Sections';
import EventSection from './EventSection';

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

  let upcoming;
  const now = moment();
  const upcomingDates = (event.dates || []).sort().map(date => moment(date))
  .filter(date => date.isAfter(now)).slice(1, 4) // skip next one
  .map(date => (
    <li key={date} className={`item item--${event.align}`}>
      {date.format('MMMM Do YYYY')}
    </li>
  ));
  if (upcomingDates.length > 0) {
    upcoming = (
      <Section align={event.align} full={false}>
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
      <Section full={false} align="start" backgroundImage={event.image}>
        <EventSection id={event} navigable={false} />
      </Section>
      <Sections align={event.align} sections={event.sections} />
      {text}
      {upcoming}
    </div>
  );
};

EventContents.propTypes = {
  item: PropTypes.object.isRequired,
};

export default EventContents;
