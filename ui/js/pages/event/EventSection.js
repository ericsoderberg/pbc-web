import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { loadItem, unloadItem } from '../../actions';
import EventTimes from './EventTimes';
import Map from '../../components/Map';
import RightIcon from '../../icons/Right';
// import Button from '../../components/Button';
import Loading from '../../components/Loading';

class EventSection extends Component {

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id) {
      this._load(nextProps);
    }
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('events', id));
  }

  _load(props) {
    const { dispatch, event, id } = props;
    if (id && !event) {
      dispatch(loadItem('events', id));
    }
  }

  render() {
    const { className, color, event, includeMap, navigable } = this.props;

    const classes = ['event-section'];
    if (className) {
      classes.push(className);
    }

    let contents;
    let map;
    if (event && event.name) {
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
  dispatch: PropTypes.func.isRequired,
  event: PropTypes.object,
  id: PropTypes.string,
  includeMap: PropTypes.bool,
  navigable: PropTypes.bool,
};

EventSection.defaultProps = {
  className: undefined,
  color: undefined,
  event: undefined,
  id: undefined,
  includeMap: false,
  navigable: true,
};

const select = (state, props) => {
  let id;
  let event;
  let notFound;
  if (props.id) {
    if (typeof props.id === 'object') {
      id = props.id._id;
      event = props.id;
    } else {
      id = props.id;
      event = props.event || state[id];
      notFound = state.notFound[id];
    }
  }
  return {
    event,
    id,
    notFound,
  };
};

export default connect(select)(EventSection);
