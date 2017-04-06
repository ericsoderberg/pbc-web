import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import {
  loadCalendar, loadCategory, unloadCalendar, unloadCategory,
} from '../../actions';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import LeftIcon from '../../icons/Left';
import RightIcon from '../../icons/Right';
import PageContext from '../page/PageContext';
import { searchToObject } from '../../utils/Params';

const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const DATE_FORMAT = 'YYYY-MM-DD';

class Calendar extends Component {

  constructor() {
    super();
    this._load = this._load.bind(this);
    this._changeDate = this._changeDate.bind(this);
    this._onChangeMonth = this._onChangeMonth.bind(this);
    this._onChangeYear = this._onChangeYear.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this._onFilter = this._onFilter.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onMore = this._onMore.bind(this);
    this.state = {
      activeCalendars: {},
      days: {},
      calendars: [],
      searchText: '',
    };
  }

  componentDidMount() {
    const { calendar, dispatch } = this.props;
    if (calendar && calendar.name) {
      document.title = `${calendar.name} Calendar`;
    } else {
      document.title = 'Calendar';
    }

    this.setState(this._stateFromProps(this.props), this._load);

    // Load the possible calendars
    dispatch(loadCategory('calendars', { select: 'name', sort: 'name' }));

    window.addEventListener('keydown', this._onKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ loading: false, loadingMore: false });
    if (nextProps.match.params.id !== this.props.match.params.id ||
      nextProps.location.search !== this.props.location.search) {
      this.setState(this._stateFromProps(nextProps), this._load);
    }
    if (nextProps.calendar && nextProps.calendar.name) {
      document.title = `${nextProps.calendar.name} Calendar`;
    }
  }

  componentDidUpdate() {
    const { loading } = this.state;
    if (this._needScrollToFocus && !loading) {
      this._needScrollToFocus = false;
      this._scrollToFocus();
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCalendar());
    dispatch(unloadCategory('calendars'));
    window.removeEventListener('keydown', this._onKeyDown);
  }

  _stateFromProps(props) {
    const { location } = props;
    const query = searchToObject(location.search);
    let focus;
    if (query.focus) {
      focus = moment(query.focus, DATE_FORMAT, true);
      if (!focus.isValid()) {
        focus = undefined;
      }
    }
    let date = focus;
    if (!date) {
      if (query.date) {
        date = moment(query.date, DATE_FORMAT, true);
        if (!date.isValid()) {
          date = undefined;
        }
      }
      if (!date) {
        date = moment();
      }
    }
    const state = {
      date,
      focus,
      searchText: query.search,
    };
    this._needScrollToFocus = query.focus !== undefined;
    return state;
  }

  _load() {
    const { dispatch, match: { params: { id } } } = this.props;
    const { activeCalendars, date, months, searchText } = this.state;
    this.setState({ loading: true }, () => {
      const ids = Object.keys(activeCalendars);
      dispatch(loadCalendar({ date, searchText, id, ids, months }));
    });
  }

  _setLocation() {
    const { router } = this.context;
    const { date, focus, searchText } = this.state;

    // update browser location
    const searchParams = [];
    if (searchText) {
      searchParams.push(`search=${encodeURIComponent(searchText)}`);
    }
    if (focus) {
      searchParams.push(
        `focus=${encodeURIComponent(focus.format(DATE_FORMAT))}`);
    } else if (date) {
      searchParams.push(`date=${encodeURIComponent(date.format(DATE_FORMAT))}`);
    }

    router.history.replace({
      pathname: window.location.pathname,
      search: `?${searchParams.join('&')}`,
    });
  }

  _scrollToFocus() {
    const focusWeek = document.querySelector('.calendar__week--focus');
    if (focusWeek) {
      const rect = focusWeek.getBoundingClientRect();
      document.body.scrollTop = rect.top;
    }
  }

  _changeDate(date) {
    return () => {
      this.setState({ date, focus: undefined }, this._load);
    };
  }

  _onChangeMonth(event) {
    const date = moment(this.state.date);
    date.month(event.target.value);
    this.setState({ date, focus: undefined }, this._load);
  }

  _onChangeYear(event) {
    const date = moment(this.state.date);
    date.year(event.target.value);
    this.setState({ date, focus: undefined }, this._load);
  }

  _onSearch(event) {
    const searchText = event.target.value;
    this.setState({ searchText });
    // throttle when user is typing
    clearTimeout(this._getTimer);
    this._getTimer = setTimeout(() => this._setLocation({ searchText }), 100);
  }

  _onFilter(event) {
    const { router } = this.context;
    const value = event.target.value;
    const search = (value && value !== 'All') ? `?name=${value}` : undefined;
    router.history.replace({ pathname: '/calendar', search });
  }

  _onMore() {
    this.setState({ months: 3, loadingMore: true }, this._load);
  }

  _onKeyDown(event) {
    const { calendar } = this.state;
    const key = (event.keyCode ? event.keyCode : event.which);
    if (LEFT_KEY === key) {
      this.setState({ date: moment(calendar.previous) }, this._get);
    } else if (RIGHT_KEY === key) {
      this.setState({ date: moment(calendar.next) }, this._get);
    }
  }

  _toggleCalendar(id) {
    return () => {
      const nextActiveCalendars = { ...this.state.activeCalendars };
      if (nextActiveCalendars[id]) {
        delete nextActiveCalendars[id];
      } else {
        nextActiveCalendars[id] = true;
      }
      this.setState({ activeCalendars: nextActiveCalendars },
        this._load);
    };
  }

  _renderDaysOfWeek() {
    const { calendar } = this.props;
    const result = [];
    let date = moment(calendar.start);
    while (result.length < 7) {
      const name = date.format('dddd');
      result.push(<div key={name} className="calendar__day">{name}</div>);
      date = date.add(1, 'day');
    }
    return result;
  }

  _renderEvent(event) {
    return (
      <li key={event.id} className="calendar__event">
        <Link to={`/events/${event.path || event._id}`}>
          <span className="calendar__event-time">
            {moment(event.start).format('h:mm a')}
          </span>
          <span className="calendar__event-name">{event.name}</span>
        </Link>
      </li>
    );
  }

  _renderDay(day) {
    const { calendar } = this.props;
    const { date: referenceDate, focus } = this.state;
    const { events } = day;
    const date = moment(day.date);

    const dayClassNames = ['calendar__day'];
    if (focus && date.isSame(focus, 'date')) {
      dayClassNames.push('calendar__day--today');
    }
    if (date.month() !== referenceDate.month()) {
      dayClassNames.push('calendar__day--alternate');
    }
    if (events.length === 0) {
      dayClassNames.push('calendar__day--empty');
    }
    if (date.date() === 1) {
      dayClassNames.push('calendar__day--first');
    }

    const path = `${((calendar.path || calendar._id) ?
      `/calendars/${calendar.path || calendar._id}` : '/calendar')}
      ?focus=${encodeURIComponent(moment(date).format(DATE_FORMAT))}`;

    const eventItems = events.map(event => this._renderEvent(event));

    return (
      <div key={date.valueOf()} className={dayClassNames.join(' ')}>
        <Link to={path} className="calendar__day-date">
          <span className="calendar__day-date-dayofweek">
            {date.format('dddd')}
          </span>
          <span className="calendar__day-date-month">
            {date.format('MMMM')}
          </span>
          <span className="calendar__day-date-day">
            {date.format('D')}
          </span>
        </Link>
        <ol className="calendar__events">
          {eventItems}
        </ol>
      </div>
    );
  }

  _renderWeeks() {
    const { calendar } = this.props;
    const { focus } = this.state;
    const weeks = calendar.weeks;

    return weeks.map((week) => {
      const { days } = week;
      const startOfWeek = moment(week.startOfWeek);

      const weekClassNames = ['calendar__week'];
      if (focus && startOfWeek.isSame(focus, 'week')) {
        weekClassNames.push('calendar__week--focus');
      }

      const dayItems = days.map(day => this._renderDay(day));

      return (
        <div key={startOfWeek.valueOf()} className={weekClassNames.join(' ')}>
          {dayItems}
        </div>
      );
    });
  }

  _renderFilter() {
    const { calendars } = this.props;
    const { activeCalendars } = this.state;
    const controls = calendars.map(calendar => (
      <div key={calendar._id} className="filter-item box--row box--static">
        <input id={calendar._id} name={calendar._id} type="checkbox"
          checked={activeCalendars[calendar._id] || false}
          onChange={this._toggleCalendar(calendar._id)} />
        <label htmlFor={calendar._id}>{calendar.name}</label>
      </div>
    ));
    controls.unshift(
      <div key="all" className="filter-item box--row box--static">
        <input id="all-calendars" name="all-calendars" type="checkbox"
          checked={Object.keys(activeCalendars).length === 0}
          onChange={() => this.setState({ activeCalendars: {} },
            this._load)} />
        <label htmlFor="all-calendars">All</label>
      </div>,
    );
    return (
      <div className="page-header__drop box--column">
        {controls}
      </div>
    );
  }

  render() {
    const { calendar, match: { params: { id } }, session } = this.props;
    const { filterActive, loadingMore, searchText, loading } = this.state;

    let contents;
    if (calendar) {
      const date = moment(calendar.date);
      const daysOfWeek = this._renderDaysOfWeek();
      const weeks = loading ? <Loading /> : this._renderWeeks();

      let filter;
      if (filterActive) {
        filter = this._renderFilter();
      }

      const actions = [];
      if (id) {
        actions.push(
          <Link key="add"
            to={`/events/add?calendarId=${encodeURIComponent(calendar._id)}`}>
            Add
          </Link>,
        );
        actions.push(
          <Link key="edit" to={`/calendars/${calendar._id}/edit`}>
            Edit
          </Link>,
        );
      } else {
        actions.push(
          <span key="filter" className="page-header__dropper">
            <Button label="Calendars"
              onClick={() => this.setState({
                filterActive: !this.state.filterActive })} />
            {filter}
          </span>,
        );
      }

      const months = [];
      const monthDate = moment(date).startOf('year');
      while (monthDate.year() === date.year()) {
        months.push(
          <option key={monthDate.month()}>{monthDate.format('MMMM')}</option>,
        );
        monthDate.add(1, 'month');
      }

      const years = [];
      const now = moment();
      const yearDate = moment().subtract(3, 'years');
      while (yearDate.year() <= (now.year() + 2)) {
        years.push(
          <option key={yearDate.year()}>{yearDate.format('YYYY')}</option>,
        );
        yearDate.add(1, 'year');
      }

      // let today;
      // if (false && !date.isSame(now, 'date')) {
      //   today = <a onClick={this._changeDate(moment())}>Today</a>;
      // }

      let more;
      if (loadingMore) {
        more = <Loading />;
      } else if (session && session.userId.administrator && weeks && weeks.length < 7) {
        more = <Button plain={true} onClick={this._onMore}>more</Button>;
      }

      let pageContext;
      if (id && calendar) {
        pageContext = (
          <PageContext filter={{ 'sections.calendarId': calendar._id }} />
        );
      }

      contents = (
        <main>
          <PageHeader title={(calendar || {}).name || 'Calendar'}
            homer={true}
            searchText={searchText} onSearch={this._onSearch}
            actions={actions} />
          <div className="calendar">
            <div className="calendar__header">
              <button type="button" className="button-icon"
                onClick={this._changeDate(moment(calendar.previous))}>
                <LeftIcon className="button__indicator" />
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
              </span>
              <button type="button" className="button-icon"
                onClick={this._changeDate(moment(calendar.next))}>
                <RightIcon className="button__indicator" />
              </button>
            </div>
            <div className="calendar__week calendar__week--header">
              {daysOfWeek}
            </div>
            {weeks}
          </div>
          {more}
          {pageContext}
        </main>
      );
    } else {
      contents = <Loading />;
    }

    return contents;
  }
}

Calendar.propTypes = {
  calendar: PropTypes.object,
  calendars: PropTypes.array,
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
    }),
  }),
};

Calendar.defaultProps = {
  calendar: undefined,
  calendars: undefined,
  session: undefined,
};

Calendar.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  calendar: state.calendar,
  calendars: (state.calendars || {}).items,
  session: state.session,
});

export default connect(select)(Calendar);
