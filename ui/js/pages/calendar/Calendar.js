"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { getCalendar, getItems } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Filter from '../../components/Filter';
import LeftIcon from '../../icons/Left';
import RightIcon from '../../icons/Right';

export default class Calendar extends Component {

  constructor () {
    super();
    this._changeDate = this._changeDate.bind(this);
    this._onChangeMonth = this._onChangeMonth.bind(this);
    this._onChangeYear = this._onChangeYear.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this._onFilter = this._onFilter.bind(this);
    this.state = { calendar: { events: [] }, searchText: '' };
  }

  componentDidMount () {
    document.title = 'Calendar';

    this._setFilter(this.props);

    // Load the possible calendars
    getItems('events', { distinct: 'calendar' })
    .then(response => this.setState({ filterOptions: response }))
    .catch(error => console.log('!!! Calendar filter catch', error));
  }

  componentWillReceiveProps (nextProps) {
    this._setFilter(nextProps);
  }

  _setFilter (props) {
    const name = props.location.query.name;
    let filter = (name ? { calendar: name } : undefined);
    this.setState({ filter: filter }, this._get);
  }

  _get () {
    getCalendar({ date: this.state.date, searchText: this.state.searchText,
      filter: this.state.filter})
    .then(response => this.setState({ calendar: response }))
    .catch(error => console.log('!!! Calendar get catch', error));
  }

  _changeDate (date) {
    return (event) => {
      this.setState({ date: date }, this._get);
    };
  }

  _onChangeMonth (event) {
    let date = moment(this.state.date);
    date.month(event.target.value);
    this.setState({ date: date }, this._get);
  }

  _onChangeYear (event) {
    let date = moment(this.state.date);
    date.year(event.target.value);
    this.setState({ date: date }, this._get);
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
    const search = (value && 'All' !== value) ? `?name=${value}` : undefined;
    this.context.router.replace({ pathname: '/calendar', search: search });
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
    events.forEach(event => {

      const start = moment(event.start);
      let eventDate;
      if (start.isSame(date, 'date')) {
        eventDate = start;
      } else if (event.dates) {
        event.dates.some(date2 => {
          eventDate = moment(date2);
          if (! eventDate.isSame(date, 'date')) {
            eventDate = undefined;
          } else {
            return true;
          }
        });
      }

      if (eventDate) {

        let time;
        if (eventDate.isSame(date, 'day')) {
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

    });
    return result;
  }

  _renderWeeks () {
    const { calendar } = this.state;
    let weeks = [];
    let today = moment();
    let focus = moment(calendar.date);
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
      if (date.isSame(today, 'date')) {
        classNames.push('calendar__day--today');
      }
      if (date.month() !== focus.month()) {
        classNames.push('calendar__day--alternate');
      }

      days.push(
        <div key={date.valueOf()} className={classNames.join(' ')}>
          <div className="calendar__day-date">
            <span className="calendar__day-date-dayofweek">
              {date.format('dddd')}
            </span>
            <span className="calendar__day-date-month">
              {date.format('MMMM')}
            </span>
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
    const { calendar, filterOptions, searchText, filter } = this.state;
    const date = moment(calendar.date);
    const daysOfWeek = this._renderDaysOfWeek();
    const weeks = this._renderWeeks();

    let filterAction;
    if (filterOptions && filterOptions.length > 1) {
      filterAction = (
        <Filter options={filterOptions}
          value={filter ? filter.calendar : undefined}
          onChange={this._onFilter} />
      );
    }

    let months = [];
    let monthDate = moment(date).startOf('year');
    while (monthDate.year() === date.year()) {
      months.push(
        <option key={monthDate.month()}>{monthDate.format('MMMM')}</option>
      );
      monthDate.add(1, 'month');
    }

    let years = [];
    let now = moment();
    let yearDate = moment().subtract(3, 'years');
    while (yearDate.year() <= (now.year() + 2)) {
      years.push(
        <option key={yearDate.year()}>{yearDate.format('YYYY')}</option>
      );
      yearDate.add(1, 'year');
    }

    let today;
    if (! date.isSame(now, 'date')) {
      today = <a onClick={this._changeDate(moment())}>Today</a>;
    }

    return (
      <main>
        <PageHeader title="Calendar" homer={true}
          searchText={searchText} onSearch={this._onSearch}
          actions={filterAction} />
        <div className="calendar">
          <div className="calendar__header">
            <button type="button" className="button-icon"
              onClick={this._changeDate(moment(calendar.previous))}>
              <LeftIcon />
            </button>
            <span>
              <select value={moment(calendar.date).format('MMMM')}
                onChange={this._onChangeMonth}>
                {months}
              </select>
              <select value={moment(calendar.date).format('YYYY')}
                onChange={this._onChangeYear}>
                {years}
              </select>
              {today}
            </span>
            <button type="button" className="button-icon"
              onClick={this._changeDate(moment(calendar.next))}>
              <RightIcon />
            </button>
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

Calendar.propTypes = {
  location: PropTypes.shape({
    query: PropTypes.object
  })
};

Calendar.contextTypes = {
  router: PropTypes.any
};
