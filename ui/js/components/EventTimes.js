"use strict";
import React, { PropTypes } from 'react';
import moment from 'moment';

const EventTimes = (props) => {
  const { event, reverse } = props;
  const start = moment(event.start);
  const yesterday = moment().subtract(1, 'day');

  let dates;
  if (event.dates && event.dates.length > 0) {
    // distinguish multiple days in the same week from the same day across weeks
    if (moment(event.dates[0]).day() === start.day()) {
      // find the next date
      let nextDate;
      event.dates.forEach(date => {
        date = moment(date);
        if (date.isAfter(yesterday) &&
          (! nextDate || date.isBefore(nextDate))) {
          nextDate = date;
        }
      });
      if (nextDate) {
        dates = (
          <span className="event-times__date">
            {nextDate.format('MMMM Do')}
          </span>
        );
      }
    } else {
      dates = [
        <span key="1" className="event-times__date">
          {start.format('MMMM Do')}
        </span>,
        <span key="sep" className="event-times__separator">-</span>,
        <span key="2" className="event-times__date">
          {moment(event.dates[event.dates.length-1]).format('MMMM Do')}
        </span>
      ];
    }
  } else {
    dates = (
      <span className="event-times__date">
        {start.format('MMMM Do YYYY')}
      </span>
    );
  }

  let times;
  if (dates) {
    times = [
      <span key="first" className="event-times__time">
        {start.format('h:mm a')}
      </span>
    ];
    if (event.times && event.times.length > 0) {
      event.times.forEach((time, index) => {
        times.push(
          <span key={index} className="event-times__separator">&</span>
        );
        times.push(
          <span key={time.start} className="event-times__time">
            {moment(time.start).format('h:mm a')}
          </span>
        );
      });
    }
  }

  if (reverse) {
    return (
      <div className="event-times">
        <span className="event-times__dates">{dates}</span>
        <span className="event-times__separator">@</span>
        <span className="event-times__times">{times}</span>
      </div>
    );
  } else {
    return (
      <div className="event-times">
        <span className="event-times__times">{times}</span>
        <span className="event-times__separator"></span>
        <span className="event-times__dates">{dates}</span>
      </div>
    );
  }
};

EventTimes.propTypes = {
  event: PropTypes.any.isRequired,
  reverse: PropTypes.bool
};

export default EventTimes;
