
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { getUnavailableDates } from '../../actions';
import Button from '../../components/Button';

const NUMBER_OF_WEEKS = 52;

export default class EventDates extends Component {

  constructor() {
    super();
    this._onToggle = this._onToggle.bind(this);
    this._get = this._get.bind(this);
    const today = moment().startOf('day');
    const start = moment(today).subtract(1, 'month').startOf('week');
    const end = moment(start).add(NUMBER_OF_WEEKS, 'weeks');
    this.state = {
      start,
      end,
      selectedDates: {},
      scroll: false,
      unavailableDates: {},
      weekDayChecked: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    const { formState: { object: event } } = nextProps;
    if (event.dates) {
      const selectedDates = {};
      event.dates.forEach((date) => {
        selectedDates[moment(date).format('YYYY-MM-DD')] = date;
      });
      this.setState({ selectedDates });
    }
  }

  componentDidUpdate() {
    const { scroll } = this.state;
    if (scroll) {
      const rect = this._containerRef.getBoundingClientRect();
      window.scrollBy(0, rect.top);
      this.setState({ scroll: false });
    }
  }

  _get() {
    const { formState } = this.props;
    const { active } = this.state;
    const event = formState.object;
    if (active) {
      if (event.resourceIds && event.resourceIds.length > 0) {
        getUnavailableDates(event)
        .then((dates) => {
          const unavailableDates = {};
          dates.forEach((date) => {
            unavailableDates[moment(date).format('YYYY-MM-DD')] = date;
          });
          this.setState({ unavailableDates, scroll: true });
        })
        .catch(error => console.error('!!! EventDates catch', error));
      } else {
        this.setState({ scroll: true });
      }
    }
    if (event.dates) {
      // Prune out any dates before the start date
      const dates = event.dates.filter(date => (
        moment(date).isAfter(this.state.start)));
      formState.set('dates', dates);
    }
  }

  _onToggle() {
    this.setState({ active: !this.state.active }, this._get);
  }

  _toggleWeekDay(day) {
    return () => {
      const { formState } = this.props;
      const event = formState.object;
      const { start, end } = this.state;

      const weekDayChecked = { ...this.state.weekDayChecked };
      weekDayChecked[day] = !weekDayChecked[day];
      this.setState({ weekDayChecked });

      let dates;
      if (weekDayChecked[day]) {
        // add all dates on the same day of the week
        dates = [];
        const date = moment(start).add(day, 'days');
        while (date < end) {
          if (!event.dates.some(date2 => moment(date2).isSame(date, 'day'))) {
            dates.push(moment(date));
          }
          date.add(1, 'week');
        }
        dates = dates.concat(event.dates);
      } else {
        // remove all dates on the same day of the week
        dates = event.dates.filter(date => moment(date).day() !== day);
      }
      formState.set('dates', dates);
    };
  }

  _renderHeader() {
    const { weekDayChecked } = this.state;
    const days = [];
    let date = moment().startOf('week');
    while (days.length < 7) {
      const name = date.format('ddd');
      const day = date.day();
      days.push(
        <div key={name} className="calendar__day">
          <div className="calendar__day-date">
            <label htmlFor={day}>{name}</label>
            <input id={day}
              type="checkbox"
              checked={weekDayChecked[day] || false}
              onChange={this._toggleWeekDay(day)} />
          </div>
        </div>,
      );
      date = date.add(1, 'day');
    }
    return (
      <div className="calendar__week">
        {days}
      </div>
    );
  }

  _renderDays() {
    const { formState } = this.props;
    const event = formState.object;
    const { start, end, selectedDates, unavailableDates } = this.state;
    const startDay = moment(event.start).startOf('day').format('YYYY-MM-DD');

    const weeks = [];
    let days = [];
    const today = moment();
    const date = moment(start);

    while (date.isBefore(end)) {
      const name = date.format(date.date() === 1 ? 'MMM D' : 'D');
      const classNames = ['calendar__day'];
      if (date.isSame(today, 'day')) {
        classNames.push('calendar__day--today');
      }
      if (date.month() % 2 !== today.month() % 2) {
        classNames.push('calendar__day--alternate');
      }

      const dateDay = date.format('YYYY-MM-DD');
      const dateValue = selectedDates[dateDay] || date.toISOString(); // deals with DST
      const checked = selectedDates[dateDay] || (dateDay === startDay);
      const disabled = unavailableDates[dateDay];

      days.push(
        <div key={name} className={classNames.join(' ')}>
          <div className="calendar__day-date">
            <label htmlFor={dateValue}>{name}</label>
            <input id={dateValue}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={formState.toggleIn('dates', dateValue)} />
          </div>
        </div>,
      );

      if (days.length === 7) {
        weeks.push(
          <div key={weeks.length} className="calendar__week">{days}</div>,
        );
        days = [];
      }

      date.add(1, 'day');
    }

    return weeks;
  }

  render() {
    const { active } = this.state;

    let calendar;
    if (active) {
      calendar = (
        <div className="calendar calendar--fixed">
          {this._renderHeader()}
          {this._renderDays()}
        </div>
      );
    }

    return (
      <fieldset ref={(ref) => { this._containerRef = ref; }}
        className="form__fields">
        <div type="button" className="form-item">
          <Button secondary={true}
            label="Recurring dates"
            onClick={this._onToggle} />
        </div>
        {calendar}
      </fieldset>
    );
  }
}

EventDates.propTypes = {
  formState: PropTypes.object.isRequired,
};
