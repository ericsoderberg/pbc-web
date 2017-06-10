import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';
import { getResourcesCalendar } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Loading from '../../components/Loading';
import { formatTimes } from '../../utils/Time';

export default class ResourcesCalendar extends Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this._load();
  }

  _load() {
    getResourcesCalendar()
    .then(calendar => this.setState({ calendar }))
    .catch(error => console.error('!!! ResourcesCalendar catch', error));
  }

  render() {
    const { calendar } = this.state;
    let contents;
    if (calendar) {
      const items = [];
      calendar.weeks.forEach((week) => {
        week.days.forEach((day) => {
          if (day.events.length > 0) {
            const date = moment(day.date);
            items.push(
              <div key={date.valueOf()} className="item resource-day">
                <span className="resource-day__date">{date.format('MMMM Do')}</span>
                <span className="resource-day__day tertiary">{date.format('dddd')}</span>
              </div>,
            );
          }
          day.events.forEach((event) => {
            const start = moment(event.start);
            const end = moment(event.end);
            const resources = event.resourceIds.map(resource => (
              <Link key={resource._id}
                className="resource-event__resource"
                to={`/resources/${resource._id}`}>{resource.name}</Link>
            ));
            items.push(
              <div key={event._id + event.start} className="item resource-event">
                <span className="resource-event__time tertiary">
                  {formatTimes(start, end)}
                </span>
                <Link className="resource-event__name"
                  to={`/events/${event.path || event._id}`}>
                  {event.name}
                </Link>
                <span className="resource-event__resources">
                  {resources}
                </span>
              </div>,
            );
          });
        });
      });
      contents = (
        <ul className="list">
          {items}
        </ul>
      );
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <PageHeader back={true} title="Resources Calendar" />
        {contents}
      </main>
    );
  }
}
