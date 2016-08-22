"use strict";
import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { getUnavailableDates } from '../../actions';

const NUMBER_OF_WEEKS = 52;

export default class EventDates extends Component {

  constructor () {
    super();
    const today = moment().startOf('day');
    const start = moment(today).subtract(1, 'month').startOf('week');
    const end = moment(start).add(NUMBER_OF_WEEKS, 'weeks');
    this.state = {
      start: start, end: end, unavailableDates: [], weekDayChecked: {}
    };
  }

  componentDidMount () {
    const { formState } = this.props;
    const event = formState.object;
    if (event.resourceIds && event.resourceIds.length > 0) {
      getUnavailableDates(event)
      .then(unavailableDates => unavailableDates.map(date => moment(date)))
      .then(unavailableDates => this.setState({ unavailableDates: unavailableDates }))
      .catch(error => console.log('!!! EventDates catch', error));
    }
    // Prune out any dates before the start date
    const dates = event.dates.filter(date => date.isBefore(this.state.start));
    formState.set('dates', dates);
  }

  _toggleWeekDay (day) {
    return () => {
      const { formState } = this.props;
      const event = formState.object;
      const { start, end } = this.state;

      let weekDayChecked = { ...this.state.weekDayChecked };
      weekDayChecked[day] = ! weekDayChecked[day];
      this.setState({ weekDayChecked: weekDayChecked });

      let dates;
      if (weekDayChecked[day]) {
        // add all dates on the same day of the week
        dates = [];
        let date = moment(start).add(day, 'days');
        while (date < end) {
          if (! event.dates.some(date2 => date2.isSame(date, 'day'))) {
            dates.push(moment(date));
          }
          date.add(1, 'week');
        }
        dates = dates.concat(event.dates);
      } else {
        // remove all dates on the same day of the week
        dates = event.dates.filter(date => date.day() !== day);
      }
      formState.set('dates', dates);
    };
  }

  _renderHeader () {
    const { weekDayChecked } = this.state;
    let days = [];
    let date = moment().startOf('week');
    while (days.length < 7) {
      const name = date.format('ddd');
      const day = date.day();
      days.push(
        <div key={name} className="calendar__day">
          <div className="calendar__day-date">
            <input type="checkbox" checked={weekDayChecked[day] || false}
              onChange={this._toggleWeekDay(day)} />
            <label>{name}</label>
          </div>
        </div>
      );
      date = date.add(1, 'day');
    }
    return (
      <div className="calendar__week">
        {days}
      </div>
    );
  }

  _renderDays () {
    const { formState } = this.props;
    const event = formState.object;
    const { start, end } = this.state;

    let weeks = [];
    let days = [];
    const today = moment().startOf('day');
    let date = moment(start);

    while (date.isBefore(end)) {
      const name = date.format(date.date() === 1 ? 'MMM D' : 'D');
      const classNames = ['calendar__day'];
      if (date.isSame(today, 'day')) {
        classNames.push('calendar__day--today');
      }
      if (date.month() % 2 !== today.month() % 2) {
        classNames.push('calendar__day--alternate');
      }

      const checked = (event.dates || []).some(date2 => {
        return moment(date2).isSame(date, 'day');
      }) || moment(event.start).isSame(date, 'day');

      const disabled = this.state.unavailableDates.some(date2 => (
        date2.isSame(date, 'day')));

      days.push(
        <div key={name} className={classNames.join(' ')}>
          <div className="calendar__day-date">
            <input type="checkbox" checked={checked} disabled={disabled}
              onChange={formState.toggleIn('dates', date.toISOString())} />
            <label>{name}</label>
          </div>
        </div>
      );

      if (7 === days.length) {
        weeks.push(
          <div key={weeks.length} className="calendar__week">{days}</div>
        );
        days = [];
      }

      date.add(1, 'day');
    }
    return weeks;
  }

  render () {
    return (
      <div className="calendar">
        {this._renderHeader()}
        {this._renderDays()}
      </div>
    );
  }
};

EventDates.propTypes = {
  formState: PropTypes.object.isRequired
};
