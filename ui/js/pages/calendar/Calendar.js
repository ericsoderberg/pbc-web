"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { getCalendar, getItems } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import LeftIcon from '../../icons/Left';
import RightIcon from '../../icons/Right';
import PageContext from '../page/PageContext';

const LEFT_KEY = 37;
const RIGHT_KEY = 39;

export default class Calendar extends Component {

  constructor () {
    super();
    this._changeDate = this._changeDate.bind(this);
    this._onChangeMonth = this._onChangeMonth.bind(this);
    this._onChangeYear = this._onChangeYear.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this._onFilter = this._onFilter.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this.state = {
      activeCalendars: {},
      calendar: { events: [] },
      days: {},
      calendars: [],
      searchText: ''
    };
  }

  componentDidMount () {
    document.title = 'Calendar';

    this._load(this.props);

    // Load the possible calendars
    getItems('calendars', { select: 'name', sort: 'name' })
    .then(calendars => this.setState({ calendars: calendars }))
    .catch(error => console.log('!!! Calendar calendars catch', error));

    window.addEventListener("keydown", this._onKeyDown);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.id !== this.props.params.id) {
      this._load(nextProps);
    }
  }

  componentWillUnmount () {
    window.removeEventListener("keydown", this._onKeyDown);
  }

  _load (props) {
    const { params: { id } } = this.props;
    const { activeCalendars, date, searchText } = this.state;
    this.setState({ loading: true });
    const ids = Object.keys(activeCalendars);
    getCalendar({ date, searchText, id, ids })
    .then(calendar => {

      // structure by day to make rendering more efficient
      let days = {};
      calendar.events.forEach(event => {
        const day = moment(event.start).startOf('day').valueOf();
        if (! days[day]) {
          days[day] = [];
        }
        days[day].push(event);
        if (event.dates) {
          event.dates.forEach(date => {
            const day2 = moment(date).startOf('day').valueOf();
            if (day2 !== day) {
              if (! days[day2]) {
                days[day2] = [];
              }
              days[day2].push(event);
            }
          });
        }
      });

      this.setState({ calendar: calendar, days: days, loading: false });
    })
    .catch(error => console.log('!!! Calendar get catch', error));
  }

  _throttledLoad () {
    // throttle gets when user is typing
    clearTimeout(this._getTimer);
    this._getTimer = setTimeout(this._load.bind(this, this.props), 100);
  }

  _changeDate (date) {
    return (event) => {
      this.setState({ date: date }, this._throttledLoad);
    };
  }

  _onChangeMonth (event) {
    let date = moment(this.state.date);
    date.month(event.target.value);
    this.setState({ date: date }, this._throttledLoad);
  }

  _onChangeYear (event) {
    let date = moment(this.state.date);
    date.year(event.target.value);
    this.setState({ date: date }, this._throttledLoad);
  }

  _onSearch (event) {
    const searchText = event.target.value;
    this.setState({ searchText: searchText }, this._throttledLoad);
  }

  _onFilter (event) {
    const value = event.target.value;
    const search = (value && 'All' !== value) ? `?name=${value}` : undefined;
    this.context.router.replace({ pathname: '/calendar', search: search });
  }

  _onKeyDown (event) {
    const { calendar } = this.state;
    const key = (event.keyCode ? event.keyCode : event.which);
    if (LEFT_KEY === key) {
      this.setState({ date: moment(calendar.previous) }, this._get);
    } else if (RIGHT_KEY === key) {
      this.setState({ date: moment(calendar.next) }, this._get);
    }
  }

  _toggleCalendar (id) {
    return () => {
      let nextActiveCalendars = { ...this.state.activeCalendars };
      if (nextActiveCalendars[id]) {
        delete nextActiveCalendars[id];
      } else {
        nextActiveCalendars[id] = true;
      }
      this.setState({ activeCalendars: nextActiveCalendars },
        this._throttledLoad);
    };
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

  _renderEvents (date) {
    const { days } = this.state;
    const events = days[date.valueOf()];
    return (events || []).map(event => {
      const start = moment(event.start);
      let time;
      if (true || start.isSame(date, 'day')) {
        time = (
          <span className="calendar__event-time">
            {start.format('h:mm a')}
          </span>
        );
      }

      return (
        <li key={event._id} className="calendar__event">
          <Link to={`/events/${event._id}`}>
            {time}
            <span className="calendar__event-name">{event.name}</span>
          </Link>
        </li>
      );
    });
  }

  _renderWeeks () {
    const { calendar } = this.state;
    let weeks = [];
    let today = moment();
    let focus = moment(calendar.date);
    let date = moment(calendar.start).startOf('day');
    let end = moment(calendar.end);
    let days, previous;

    while (date.isSameOrBefore(end)) {

      if (! previous || previous.isBefore(date, 'week')) {
        if (previous) {
          weeks.push(this._renderWeek(days, previous.valueOf()));
        }
        days = [];
      }
      const dayEvents = this._renderEvents(date, days);

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

  _renderFilter () {
    const { activeCalendars, calendars } = this.state;
    const controls = calendars.map(calendar => (
      <div key={calendar._id} className="filter-item box--row">
        <input id={calendar._id} name={calendar._id} type="checkbox"
          checked={activeCalendars[calendar._id] || false}
          onChange={this._toggleCalendar(calendar._id)} />
        <label htmlFor={calendar._id}>{calendar.name}</label>
      </div>
    ));
    controls.unshift(
      <div key="all" className="filter-item box--row">
        <input id="all-calendars" name="all-calendars" type="checkbox"
          checked={Object.keys(activeCalendars).length === 0}
          onChange={() => this.setState({ activeCalendars: {} },
            this._throttledLoad)} />
        <label htmlFor="all-calendars">All</label>
      </div>
    );
    return (
      <div className="page-header__drop box--column">
        {controls}
      </div>
    );
  }

  render () {
    const { params: { id } } = this.props;
    const { calendar, filterActive, searchText, loading } = this.state;
    const date = moment(calendar.date);
    const daysOfWeek = this._renderDaysOfWeek();
    const weeks = loading ? undefined : this._renderWeeks();
    const loadingIndicator = loading ? <Loading /> : undefined;

    let filter;
    if (filterActive) {
      filter = this._renderFilter();
    }

    let actions = [];
    if (id) {
      actions.push(
        <Link key="add"
          to={`/events/add?calendarId=${encodeURIComponent(calendar._id)}`}
          className="a-header">Add</Link>
      );
      actions.push(
        <Link key="edit" to={`/calendars/${calendar._id}/edit`}
          className="a-header">Edit</Link>
      );
    } else {
      actions.push(
        <nav key="filter" className="page-header__actions">
          <span className="page-header__dropper">
            <Button label="Calendars" className="button-header"
              onClick={() => this.setState({
                filterActive: ! this.state.filterActive})}/>
            {filter}
          </span>
        </nav>
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
        <PageHeader title={calendar.name || 'Calendar'}
          homer={id ? false : true}
          back={id ? true : false}
          searchText={searchText} onSearch={this._onSearch}
          actions={actions} />
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
          {loadingIndicator}
        </div>
        <PageContext
          filter={calendar ? { 'sections.calendarId': calendar._id }
            : undefined} />
      </main>
    );
  }
};

Calendar.propTypes = {
  location: PropTypes.shape({
    query: PropTypes.object
  }),
  params: PropTypes.shape({
    id: PropTypes.string
  })
};

Calendar.contextTypes = {
  router: PropTypes.any
};
