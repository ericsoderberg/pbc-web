import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';

export default class CalendarGrid extends Component {

  // _scrollToFocus() {
  //   const focusWeek = document.querySelector('.calendar__week--focus');
  //   if (focusWeek) {
  //     const rect = focusWeek.getBoundingClientRect();
  //     document.body.scrollTop = rect.top;
  //   }
  // }

  _renderDaysOfWeek() {
    const { weeks } = this.props;
    const result = [];
    let date = moment(weeks[0].start);
    while (result.length < 7) {
      const name = date.format('dddd');
      result.push(<div key={name} className="calendar__day">{name}</div>);
      date = date.add(1, 'day');
    }
    return result;
  }

  _renderEvent(event) {
    const start = moment(event.start);
    return (
      <li key={event.id} className="calendar__event">
        <Link to={`/events/${event.path || event._id}`}>
          <span className="calendar__event-time">
            {start.format('h:mm a')}
          </span>
          <span className="calendar__event-name">{event.name}</span>
        </Link>
      </li>
    );
  }

  _renderDay(day, referenceMonth) {
    const { activeDate } = this.props;
    const date = moment(day.date);

    const dayClassNames = ['calendar__day'];
    if (activeDate && date.isSame(activeDate, 'date')) {
      dayClassNames.push('calendar__day--active');
    }
    if (date.month() !== referenceMonth) {
      dayClassNames.push('calendar__day--alternate');
    }
    if (day.events.length === 0) {
      dayClassNames.push('calendar__day--empty');
    }
    if (date.date() === 1) {
      dayClassNames.push('calendar__day--first');
    }

    const events = day.events.map(event => this._renderEvent(event));

    return (
      <div key={date.valueOf()} className={dayClassNames.join(' ')}>
        <div className="calendar__day-date">
          <span className="calendar__day-date-dayofweek">
            {date.format('dddd')}
          </span>
          <span className="calendar__day-date-month">
            {date.format('MMMM')}
          </span>
          <span className="calendar__day-date-day">
            {date.format('D')}
          </span>
        </div>
        <ol className="calendar__events">
          {events}
        </ol>
      </div>
    );
  }

  _renderWeeks() {
    const { activeDate, weeks } = this.props;

    // Use the last day of the first week as the month we care about.
    // This works because if this was in the previous month, the week wouldn't
    // have been included. ;)
    const referenceMonth =
      moment(weeks[0].days[weeks[0].days.length - 1].date).month();
    return weeks.map((week) => {
      const start = moment(week.start);
      const weekClassNames = ['calendar__week'];
      if (activeDate && start.isSame(activeDate, 'week')) {
        weekClassNames.push('calendar__week--active');
      }

      const days = week.days.map(day => this._renderDay(day, referenceMonth));

      return (
        <div key={start.valueOf()} className={weekClassNames.join(' ')}>
          {days}
        </div>
      );
    });
  }

  render() {
    const daysOfWeek = this._renderDaysOfWeek();
    const weeks = this._renderWeeks();

    return (
      <div className="calendar">
        <div className="calendar__week calendar__week--header">
          {daysOfWeek}
        </div>
        {weeks}
      </div>
    );
  }
}

CalendarGrid.propTypes = {
  activeDate: PropTypes.object,
  weeks: PropTypes.arrayOf(PropTypes.shape({
    start: PropTypes.string.isRequired,
    days: PropTypes.arrayOf(PropTypes.shape({
      date: PropTypes.string.isRequired,
      events: PropTypes.arrayOf(PropTypes.object).isRequired,
    })).isRequired,
  })).isRequired,
};

CalendarGrid.defaultProps = {
  activeDate: undefined,
};
