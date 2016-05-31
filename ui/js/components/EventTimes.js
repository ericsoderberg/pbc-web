"use strict";
import React, { PropTypes } from 'react';
import moment from 'moment';

const EventTimes = (props) => {
  const { event } = props;

  let additionalTimes = '';
  if (event.times && event.times.length > 0) {
    additionalTimes = ' & ' + event.times.map(time => {
      return moment(time.start).format('h:mm a');
    }).join(' & ');
  }
  const start = moment(event.start);

  let dates;
  if (event.dates && event.dates.length > 0) {
    // distinguish multiple days in the same week from the same day across weeks
    if (moment(event.dates[0]).isSame(moment(event.start), 'day')) {
      dates = start.format('dddd[s]');
    } else {
      dates = start.format('MMMM Do') + ' - ' +
        moment(event.dates[event.dates.length-1]).format('MMMM Do');
    }
  } else {
    dates = start.format('MMMM Do YYYY');
  }
  const times = start.format('h:mm a') + additionalTimes;

  return (
    <div className="event-times">
      <span className="event-times__dates">{dates}</span>
      <span className="event-times__times">{times}</span>
    </div>
  );
};

EventTimes.propTypes = {
  event: PropTypes.any.isRequired
};

export default EventTimes;
