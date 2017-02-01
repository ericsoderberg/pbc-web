"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { getItem, getItems } from '../../actions';
import EventTimes from '../../components/EventTimes';
import Map from '../../components/Map';
import Section from '../../components/Section';
import Button from '../../components/Button';
import EventSummary from '../event/EventSummary';

export default class CalendarSummary extends Component {

  constructor (props) {
    super(props);
    this.state = {
      calendar: (typeof props.id === 'string' ? props.id : {}),
      events: []
    };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.id !== nextProps.id) {
      this._load(nextProps);
    }
  }

  _load (props) {
    if (props.id) {

      let calendarId;
      if (typeof props.id === 'object') {
        calendarId = props.id._id;
        this.setState({ calendar: props.id });
      } else {
        calendarId = props.id;
        getItem('calendars', props.id)
        .then(calendar => this.setState({ calendar }))
        .catch(error => console.log('!!! CalendarSummary calendar catch',
          error));
      }

      const start = moment().startOf('day');
      const end = moment(start).add(2, 'month');
      getItems('events', {
        filter: {
          calendarId: calendarId,
          // TODO: move this logic to the server side
          $or: [
            { end: { $gte: start.toDate() }, start: { $lt: end.toDate() } },
            { dates: { $gte: start.toDate(), $lt: end.toDate() }}
          ]
        }
      })
      .then(events => {
        // sort by which comes next
        const nextDate = (event) => (
          [ ...event.dates, event.start ]
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
      .catch(error => console.log('!!! CalendarSummary events catch', error));
    }
  }

  _renderCalendar () {
    const { excludeEventIds } = this.props;
    const { calendar, events } = this.state;
    let result;
    if (events.length > 0) {
      result = events
      .filter(event => excludeEventIds.indexOf(event._id) === -1)
      .map(event => (
        <Section key={event._id} align='center' full={true}
          backgroundImage={event.image}>
          <EventSummary key={event._id} id={event} />
        </Section>
      ));
    } else {
      result = (
        <Button path={`/calendars/${calendar.path || calendar._id}`}
          right={true}>
          Calendar
        </Button>
      );
    }

    return result;
  }

  render () {
    const { className } = this.props;
    let classes = ['calendar-summary'];
    if (className) {
      classes.push(className);
    }
    let contents = this._renderCalendar();
    return (
      <div className={classes.join(' ')}>
        {contents}
      </div>
    );
  }
};

CalendarSummary.propTypes = {
  excludeEventIds: PropTypes.arrayOf(PropTypes.string),
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};
