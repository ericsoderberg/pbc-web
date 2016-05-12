"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { getCalendar, getItems } from '../../actions';
import PageHeader from '../../components/PageHeader';

export default class Calendar extends Component {

  constructor () {
    super();
    this._changeDate = this._changeDate.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this._onFilter = this._onFilter.bind(this);
    this.state = { calendar: { events: [] }, searchText: '' };
  }

  componentDidMount () {
    getCalendar()
    .then(response => this.setState({ calendar: response }));

    getItems('events', { distinct: 'calendar' })
    .then(response => this.setState({ filterValues: response }))
    .catch(error => console.log('!!! Calendar filter catch', error));
  }

  componentWillReceiveProps (nextProps) {
    const filterValue = nextProps.location.query.calendar;
    let filter = (filterValue ? { calendar: filterValue } : undefined);
    this.setState({ filter: filter }, this._get);
  }

  _get () {
    getCalendar({ date: this.state.date, searchText: this.state.searchText,
      filter: this.state.filter})
    .then(response => this.setState({ calendar: response }));
  }

  _changeDate (date) {
    return (event) => {
      this.setState({ date: date }, this._get);
    };
  }

  _onSearch (event) {
    const searchText = event.target.value;
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this._get();
    }, 100);
    this.setState({ searchText: searchText });
  }

  _onFilter (event) {
    const value = event.target.value;
    this.context.router.replace({ pathname: window.location.pathname,
      query: { calendar: value } });
  }

  _renderDaysOfWeek () {
    const { calendar: { start } } = this.state;
    let result = [];
    let date = moment(start);
    while (result.length < 7) {
      const name = date.format('dddd');
      result.push(<div key={name} className="calendar__day">{name}</div>);
      date = date.add(1, 'day');
    }
    return result;
  }

  _renderWeek (days, key) {
    return (
      <div key={key} className="calendar__week">
        {days}
      </div>
    );
  }

  _renderEvents (date, events) {
    let result = [];
    while (events.length > 0 &&
      moment(events[0].start).isSame(date, 'date')) {
      const event = events.shift();
      const start = moment(event.start);
      let time;
      if (start.isAfter(date)) {
        time = (
          <span className="calendar__event-time">
            {start.format('h:mm a')}
          </span>
        );
      }
      result.push(
        <li key={event._id} className="calendar__event">
          <Link to={`/events/${event._id}`}>
            {time}
            {event.name}
          </Link>
        </li>
      );
    }
    return result;
  }

  _renderWeeks () {
    const { calendar } = this.state;
    let weeks = [];
    let now = moment();
    let date = moment(calendar.start);
    let end = moment(calendar.end);
    let events = calendar.events.slice(0);
    let days, previous;

    while (date.isSameOrBefore(end)) {

      if (! previous || previous.isBefore(date, 'week')) {
        if (previous) {
          weeks.push(this._renderWeek(days, previous.valueOf()));
        }
        days = [];
      }
      const dayEvents = this._renderEvents(date, events);

      let classNames = ['calendar__day'];
      if (date.isSame(now, 'date')) {
        classNames.push('calendar__day--today');
      }

      days.push(
        <div key={date.valueOf()} className={classNames.join(' ')}>
          <div className="calendar__day-date">
            {date.format('D')}
          </div>
          <ol className="calendar__events">
            {dayEvents}
          </ol>
        </div>
      );

      previous = moment(date);
      date.add(1, 'day');
    }
    if (previous) {
      weeks.push(this._renderWeek(days, previous.valueOf()));
    }

    return weeks;
  }

  render () {
    const { calendar, filterValues, searchText } = this.state;
    const daysOfWeek = this._renderDaysOfWeek();
    const weeks = this._renderWeeks();

    let filterControl;
    if (filterValues) {
      let options = (filterValues || []).map(value => (
        <option key={value}>{value}</option>
      ));
      options.unshift(<option key="_all"></option>);
      filterControl = (
        <select key="filter" className="select--header" onChange={this._onFilter}>
          {options}
        </select>
      );
    }

    return (
      <main>
        <PageHeader title="Calendar"
          searchText={searchText} onSearch={this._onSearch}
          actions={filterControl} />
        <div className="calendar">
          <div className="calendar__header">
            <a onClick={this._changeDate(moment(calendar.previous))}>
              {moment(calendar.previous).format('< MMMM')}
            </a>
            <span className="calendar__title">
              {moment(calendar.date).format('MMMM YYYY')}
            </span>
            <a onClick={this._changeDate(moment())}>
              Today
            </a>
            <a onClick={this._changeDate(moment(calendar.next))}>
              {moment(calendar.next).format('MMMM >')}
            </a>
          </div>
          <div className="calendar__week calendar__week--header">
            {daysOfWeek}
          </div>
          {weeks}
        </div>
      </main>
    );
  }
};

Calendar.contextTypes = {
  router: PropTypes.any
};
