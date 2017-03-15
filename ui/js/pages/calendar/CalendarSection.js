import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { getItem, getItems } from '../../actions';
import Section from '../../components/Section';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import EventSection from '../event/EventSection';

export default class CalendarSection extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.id !== nextProps.id) {
      this._load(nextProps);
    }
  }

  _load(props) {
    const { omitRecurring } = props;
    if (props.id) {
      let calendarId;
      if (typeof props.id === 'object') {
        calendarId = props.id._id;
        this.setState({ calendar: props.id });
      } else {
        calendarId = props.id;
        getItem('calendars', props.id)
        .then(calendar => this.setState({ calendar }))
        .catch(error => console.error('!!! CalendarSummary calendar catch',
          error));
      }

      if (props.events) {
        this.setState({ events: props.events });
      } else {
        const start = moment().startOf('day');
        const end = moment(start).add(2, 'month');
        const filter = {
          calendarId,
          $or: [
            { end: { $gte: start.toDate() }, start: { $lt: end.toDate() } },
            { dates: { $gte: start.toDate(), $lt: end.toDate() } },
          ],
        };
        if (omitRecurring) {
          filter.dates = { $exists: true, $size: 0 };
        }
        getItems('events', { filter })
        .then((events) => {
          // sort by which comes next
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
          this.setState({ events });
        })
        .catch(error => console.error('!!! CalendarSummary events catch', error));
      }
    }
  }

  _renderCalendar() {
    const { excludeEventIds } = this.props;
    const { calendar, events } = this.state;
    let result;
    if (events && events.length > 0) {
      result = events
      .filter(event => excludeEventIds.indexOf(event._id) === -1)
      .map(event => (
        <Section key={event._id} align="center" full={true}
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
  className: PropTypes.string,
  events: PropTypes.arrayOf(PropTypes.object),
  excludeEventIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  omitRecurring: PropTypes.bool,
};

CalendarSection.defaultProps = {
  className: undefined,
  events: undefined,
  id: undefined,
  omitRecurring: false,
};
