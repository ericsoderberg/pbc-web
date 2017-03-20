
import React, { PropTypes } from 'react';
import moment from 'moment';

const formatDate = (date, dayOfWeek = true) =>
  date.format(
    `${dayOfWeek ? 'dddd ' : ''}MMMM Do${date.isSame(moment().startOf('day'), 'year') ? '' : ' YYYY'}`);

const formatTime = (date, ampm = true) =>
  date.format(`${date.minute() === 0 ? 'h' : 'h:mm'}${ampm ? ' a' : ''}`);

const formatTimes = (date1, date2) => {
  const noon = moment(date1).startOf('day').add(12, 'hours');
  const sameAmpm = ((date1.isBefore(noon) && date2.isBefore(noon)) ||
    (date1.isAfter(noon) && date2.isAfter(noon)));
  return `${formatTime(date1, !sameAmpm)} - ${formatTime(date2)}`;
};

const TimesSet = (props) => {
  const { start, end } = props;
  const noon = moment(start).startOf('day').add(12, 'hours');
  const sameAmpm = ((start.isBefore(noon) && end.isBefore(noon)) ||
    (start.isSameOrAfter(noon) && end.isSameOrAfter(noon)));
  return (
    <span className="event-times__set">
      <span className="event-times__label">{formatTime(start, !sameAmpm)}</span>
      <span className="event-times__separator">-</span>
      <span className="event-times__label">{formatTime(end)}</span>
    </span>
  );
};

TimesSet.propTypes = {
  start: PropTypes.object.isRequired,
  end: PropTypes.object.isRequired,
};

const EventTimes = (props) => {
  const { event, size } = props;
  const start = moment(event.start);
  const end = moment(event.end);
  const now = moment().startOf('day');
  // const yesterday = moment(now).subtract(1, 'day');

  const classes = ['event-times'];
  if (size) {
    classes.push(`event-times--${size}`);
  }

  let contents;

  if (event.dates && event.dates.length > 0) {
    // Recurring event

    // make into moments
    const dates = event.dates.slice(0).map(date => moment(date));
    // merge start
    if (!dates.some(date => date.isSame(start, 'day'))) {
      dates.push(start);
    }
    // sort
    dates.sort((date1, date2) => {
      if (date1.isBefore(date2)) return -1;
      if (date1.isAfter(date2)) return 1;
      return 0;
    });

    // We consider four kinds of recurrence:
    // 1) multiple consecutive days, such as VBS
    // 2) weekly, such as HS Sundays
    // 3) infrequent but always the same day of the week, such as elders meetings
    // 3) irregular
    // Figure out which kind we have.

    let consecutive = true;
    let weekly = true;
    let sameDayOfWeek = true;
    let previousDate;
    dates.forEach((date) => {
      if (previousDate) {
        if (!moment(date).subtract(1, 'day').isSame(previousDate, 'day')) {
          consecutive = false;
        }
        if (!moment(date).subtract(1, 'week').isSame(previousDate, 'day')) {
          weekly = false;
        }
        if (date.day() !== previousDate.day()) {
          sameDayOfWeek = false;
        }
      }
      previousDate = date;
    });

    if (consecutive) {
      const first = dates[0];
      const last = dates[dates.length - 1];

      contents = [
        <div key={1} className="event-times__set">
          <span className="event-times__label">{formatDate(first)}</span>
          <span className="event-times__separator">-</span>
          <span className="event-times__label">{formatDate(last)}</span>
        </div>,
        <span key={2} className="event-times__separator">@</span>,
        <TimesSet key={3} start={start} end={end} />,
      ];
    } else if (weekly) {
      contents = (
        <div className="event-times__set">
          <span className="event-times__label">{start.format('dddd[s]')}</span>
          <span className="event-times__separator">@</span>
          <span className="event-times__label">{formatTimes(start, end)}</span>
        </div>
      );
    } else if (sameDayOfWeek && dates.length > 4) {
      // not weekly, but regular enough
      // pick the next date in the future
      let nextDate;
      dates.some((date) => {
        if (date.isSameOrAfter(now)) {
          nextDate = date;
        }
        return nextDate;
      });
      if (!nextDate) {
        nextDate = dates[dates.length - 1];
      }

      contents = (
        <div className="event-times__set">
          <span className="event-times__label">{formatDate(nextDate)}</span>
          <span className="event-times__separator">@</span>
          <span className="event-times__label">{formatTimes(start, end)}</span>
        </div>
      );
    } else {
      // irreguler
      const datesString = dates.filter(date => date.isSameOrAfter(now))
      .slice(0, 4)
      .map(date => formatDate(date, false)).join(', ');

      contents = [
        <div key={1} className="event-times__set">
          <span className="event-times__label">{datesString}</span>
        </div>,
        <span key={2} className="event-times__separator">@</span>,
        <TimesSet key={3} start={start} end={end} />,
      ];
    }
  } else if (!start.isSame(end, 'day')) {
    // multi-day, non-recurring
    contents = [
      <div key={1} className="event-times__set">
        <span className="event-times__label">{formatDate(start)}</span>
        <span className="event-times__separator">@</span>
        <span className="event-times__label">{formatTime(start)}</span>
      </div>,
      <span key={2} className="event-times__separator">-</span>,
      <div key={3} className="event-times__set">
        <span className="event-times__label">{formatDate(end)}</span>
        <span className="event-times__separator">@</span>
        <span className="event-times__label">{formatTime(end)}</span>
      </div>,
    ];
  } else {
    // single day, non-recurring
    contents = (
      <div className="event-times__set">
        <span className="event-times__label">{formatDate(start)}</span>
        <span className="event-times__separator">@</span>
        <span className="event-times__label">{formatTimes(start, end)}</span>
      </div>
    );
  }

  return <div className={classes.join(' ')}>{contents}</div>;
};

EventTimes.propTypes = {
  event: PropTypes.any.isRequired,
  size: PropTypes.oneOf(['medium', 'large']),
};

EventTimes.defaultProps = {
  size: undefined,
};

export default EventTimes;