
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { getResourceEvents } from '../../actions';
import Loading from '../../components/Loading';

export default class ResourceContents extends Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this._load();
  }

  _load() {
    const { item: resource } = this.props;
    getResourceEvents(resource)
    .then(events => this.setState({ events }))
    .catch(error => console.error('!!! ResourceContents catch', error));
  }

  render() {
    const { events } = this.state;

    let contents;
    if (!events) {
      contents = <Loading />;
    } else {
      const items = [];
      let day;
      events.forEach((event) => {
        const start = moment(event.start);
        if (!day || !start.isSame(day, 'day')) {
          day = start;
          items.push(
            <div key={day.valueOf()} className="item resource-day">
              <span className="resource-day__date">{day.format('MMMM Do')}</span>
              <span className="resource-day__day tertiary">{day.format('dddd')}</span>
            </div>,
          );
        }
        items.push(
          <div key={event.id} className="item resource-event">
            <span className="resource-event__time tertiary">{start.format('h:mm a')}</span>
            <Link to={`/events/${event.path || event._id}`}>{event.name}</Link>
          </div>,
        );
      });
      contents = (
        <ul className="list">
          {items}
        </ul>
      );
    }
    return contents;
  }
}

ResourceContents.propTypes = {
  item: PropTypes.object.isRequired,
};
