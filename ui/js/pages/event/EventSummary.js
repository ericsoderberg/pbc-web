"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import EventTimes from '../../components/EventTimes';
import Image from '../../components/Image';
import Map from '../../components/Map';
import RightIcon from '../../icons/Right';
// import Button from '../../components/Button';
import Loading from '../../components/Loading';

export default class EventSummary extends Component {

  constructor (props) {
    super(props);
    this.state = { event: (typeof props.id === 'string' ? props.id : {}) };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.id !== this.props.id) {
      this._load(nextProps);
    }
  }

  _load (props) {
    const { id } = props;
    if (typeof id === 'object') {
      this.setState({ event: id });
    } else if (typeof id === 'string') {
      getItem('events', id)
      .then(event => this.setState({ event: event }))
      .catch(error => console.log('!!! EventSummary catch', error));
    }
  }

  render () {
    const { className, includeMap, navigable } = this.props;
    const { event } = this.state;

    let classes = ["event-summary"];
    if (className) {
      classes.push(className);
    }

    let contents, map;
    if (event) {

      // if (event.backgroundImage) {
      //   backgroundImage =
      //     <Image image={event.backgroundImage} full={false} plain={true} />;
      // }

      // if (event.image) {
      //   image = (
      //     <Image image={event.image} full={false} plain={true} />
      //   );
      // }
      let location;
      if (event.location) {
        location = (
          <div className='event-summary__location'>{event.location}</div>
        );
      }

      if (false === navigable) {
        contents = (
          <div className="event-summary__text-container">
            <div className="event-summary__text">
              <h2 className='event-summary__name'>{event.name}</h2>
              <EventTimes event={event} reverse={true} size="large" />
              {location}
            </div>
          </div>
        );
      } else {
        contents = (
          <div className="event-summary__text-container">
            <Link className="event-summary__text"
              to={`/events/${event.path || event._id}`}>
              <div className='event-summary__name'>
                <h2>{event.name}</h2>
                <RightIcon />
              </div>
              <EventTimes event={event} reverse={true} size="large" />
              {location}
            </Link>
          </div>
        );
      }

      if (includeMap && event.address) {
        map = (
          <div className="event-summary__map">
            <Map address={event.address} plain={true} />
          </div>
        );
      }
    } else {
      contents = <Loading />;
    }

    return (
      <div className={classes.join(' ')}>
        <div className="event-summary__contents">
          {contents}
          {map}
        </div>
      </div>
    );
  }
};

EventSummary.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  includeMap: PropTypes.bool,
  navigable: PropTypes.bool
};
