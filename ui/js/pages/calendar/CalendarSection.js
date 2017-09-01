import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import { loadItem, unloadItem, loadCategory, unloadCategory } from '../../actions';
import Section from '../../components/Section';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import EventSection from '../event/EventSection';

class CalendarSection extends Component {

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.id !== nextProps.id) {
      this._load(nextProps);
    }
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('calendars', id));
    dispatch(unloadCategory('events'));
  }

  _load(props) {
    const { calendar, dispatch, events, id, omitRecurring } = props;
    if (id) {
      if (!calendar) {
        dispatch(loadItem('calendars', id));
      } else if (!events) {
        const start = moment().startOf('day');
        const end = moment(start).add(2, 'month');
        const filter = {
          calendarId: props.id,
          $or: [
            { end: { $gte: start.toDate() }, start: { $lt: end.toDate() } },
            { dates: { $gte: start.toDate(), $lt: end.toDate() } },
          ],
        };
        if (omitRecurring) {
          filter.dates = { $exists: true, $size: 0 };
        }
        dispatch(loadCategory('events', { filter }));
      }
    }
  }

  _renderCalendar() {
    const { calendar, events, excludeEventIds } = this.props;
    let result;
    if (events && events.length > 0) {
      result = events
        .filter(event => excludeEventIds.indexOf(event._id) === -1)
        .map(event => (
          <Section key={event._id}
            align="center"
            full={true}
            backgroundImage={event.image}>
            <EventSection key={event._id} id={event} />
          </Section>
        ));
    } else if (calendar) {
      result = (
        <Button path={`/calendars/${calendar.path || calendar._id}`}
          right={true}>
          Calendar
        </Button>
      );
    } else {
      result = <Loading />;
    }

    return result;
  }

  render() {
    const { className } = this.props;
    const classes = ['calendar-summary'];
    if (className) {
      classes.push(className);
    }
    const contents = this._renderCalendar();
    return (
      <div className={classes.join(' ')}>
        {contents}
      </div>
    );
  }
}

CalendarSection.propTypes = {
  calendar: PropTypes.object,
  className: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.object),
  excludeEventIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  omitRecurring: PropTypes.bool,
};

CalendarSection.defaultProps = {
  calendar: undefined,
  className: undefined,
  events: undefined,
  id: undefined,
  omitRecurring: false,
};

const select = (state, props) => {
  let id;
  let calendar;
  let notFound;
  let events = props.events;
  if (props.id) {
    if (typeof props.id === 'object') {
      id = props.id._id;
      calendar = props.id;
    } else {
      id = props.id;
      calendar = props.calendar || state[id];
      notFound = state.notFound[id];
    }

    if (!events && state.events) {
      events = state.events.items;
      if (events) {
        // sort by which comes next
        const start = moment().startOf('day');
        const end = moment(start).add(2, 'month');
        const nextDate = event => (
          [...event.dates, event.start]
            .map(d => moment(d))
            .filter(d => d.isSameOrAfter(start) && d.isSameOrBefore(end))[0]
        );
        events.sort((e1, e2) => {
          const d1 = nextDate(e1);
          const d2 = nextDate(e2);
          return d1.isBefore(d2) ? -1 : d2.isBefore(d1) ? 1 : 0;
        });
      }
    }
  }
  return {
    calendar,
    events,
    id,
    notFound,
  };
};

export default connect(select)(CalendarSection);
