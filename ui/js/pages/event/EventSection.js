import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import EventTimes from './EventTimes';
import Map from '../../components/Map';
import RightIcon from '../../icons/Right';
// import Button from '../../components/Button';
import Loading from '../../components/Loading';

export default class EventSection extends Component {

  constructor(props) {
    super(props);
    this.state = { event: (typeof props.id === 'string' ? props.id : {}) };
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id) {
      this._load(nextProps);
    }
  }

  _load(props) {
    const { id } = props;
    if (typeof id === 'object') {
      this.setState({ event: id });
    } else if (typeof id === 'string') {
      getItem('events', id)
      .then(event => this.setState({ event }))
      .catch(error => console.error('!!! EventSummary catch', error));
    }
  }

  render() {
    const { className, color, includeMap, navigable } = this.props;
    const { event } = this.state;

    const classes = ['event-section'];
    if (className) {
      classes.push(className);
    }

    let contents;
    let map;
    if (event) {
      let location;
      if (event.location) {
        location = (
          <div className="event-section__location">{event.location}</div>
        );
      }
      let style;
      if (color) {
        style = { backgroundColor: color };
      }

      if (navigable === false) {
        contents = (
          <div className="event-section__text-container">
            <div className="event-section__text" style={style}>
              <h2 className="event-section__name">{event.name}</h2>
              <EventTimes event={event} size="large" />
              {location}
            </div>
          </div>
        );
      } else {
        contents = (
          <div className="event-section__text-container">
            <Link className="event-section__text" style={style}
              to={`/events/${event.path || event._id}`}>
              <div className="event-section__name">
                <h2>{event.name}</h2>
                <RightIcon className="anchor__indicator" />
              </div>
              <EventTimes event={event} size="large" />
              {location}
            </Link>
          </div>
        );
      }

      if (includeMap && event.address) {
        map = (
          <div className="event-section__map">
            <Map address={event.address} plain={true} />
          </div>
        );
      }
    } else {
      contents = <Loading />;
    }

    return (
      <div className={classes.join(' ')}>
        <div className="event-section__contents">
          {contents}
          {map}
        </div>
      </div>
    );
  }
}

EventSection.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  includeMap: PropTypes.bool,
  navigable: PropTypes.bool,
};

EventSection.defaultProps = {
  className: undefined,
  color: undefined,
  id: undefined,
  includeMap: false,
  navigable: true,
};
