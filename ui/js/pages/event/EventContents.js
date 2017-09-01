
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import Section from '../../components/Section';
import Text from '../../components/Text';
import Sections from '../../components/Sections';
import EventSection from './EventSection';

const EventContents = (props) => {
  const event = props.item;
  const align = event.align || 'center';

  let text;
  if (event.text) {
    text = (
      <Section full={false}>
        <Text text={event.text} />
      </Section>
    );
  }

  let upcoming;
  const today = moment().startOf('day');
  const upcomingDates = (event.dates || []).sort().map(date => moment(date))
    .filter(date => date.isAfter(today)).slice(0, 3)
    .map(date => (
      <li key={date} className={`item item--${align}`}>
        {date.format('MMMM Do YYYY')}
      </li>
    ));
  if (upcomingDates.length > 0) {
    upcoming = (
      <Section align={align} full={false}>
        <div>
          <h3>Upcoming</h3>
          <ul className="list">
            {upcomingDates}
          </ul>
        </div>
      </Section>
    );
  }

  let innerColor;
  if (event.image && event.color) {
    innerColor = event.color;
  }

  return (
    <div>
      <Section full={false}
        align={event.align || 'center'}
        backgroundImage={event.image}
        color={event.color}>
        <EventSection id={event} navigable={false} color={innerColor} />
      </Section>
      <Sections align={align} sections={event.sections} />
      {text}
      {upcoming}
    </div>
  );
};

EventContents.propTypes = {
  item: PropTypes.object.isRequired,
};

export default EventContents;
