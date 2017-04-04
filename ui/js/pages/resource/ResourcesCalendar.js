import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { getResourcesEvents } from '../../actions';
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
    getResourcesEvents()
    .then(events => this.setState({ events }))
    .catch(error => console.error('!!! ResourcesCalendar catch', error));
  }

  render() {
    const { events } = this.state;
    let contents;
    if (events) {
      const items = [];
      let day;
      events.forEach((event) => {
        const start = moment(event.start);
        const end = moment(event.end);

        if (!day || !start.isSame(day, 'day')) {
          day = start;
          items.push(
            <div key={day.valueOf()} className="item resource-day">
              <span className="resource-day__date">{day.format('MMMM Do')}</span>
              <span className="resource-day__day tertiary">{day.format('dddd')}</span>
            </div>,
          );
        }

        const resources = event.resourceIds.map(resource => (
          <Link key={resource._id} className="resource-event__resource"
            to={`/resources/${resource._id}`}>{resource.name}</Link>
        ));
        items.push(
          <div key={event.id} className="item resource-event">
            <span className="resource-event__time tertiary">
              {formatTimes(start, end)}
            </span>
            <Link className="resource-event__name" to={`/events/${event.path || event._id}`}>{event.name}</Link>
            <span className="resource-event__resources">
              {resources}
            </span>
          </div>,
        );
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
