"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import EventTimes from '../../components/EventTimes';
import Image from '../../components/Image';
import Map from '../../components/Map';
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
    const { className, navigable } = this.props;
    const { event } = this.state;

    let classes = ["event-summary"];
    if (className) {
      classes.push(className);
    }

    let image, contents, map;
    if (event) {

      if (event.backgroundImage) {
        backgroundImage =
          <Image image={event.backgroundImage} full={false} plain={true} />;
      }

      if (event.image) {
        image = (
          <Image image={event.image} full={false} plain={true} />
        );
      }

      if (false === navigable) {
        contents = (
          <div className="event-summary__text-container">
            <div className="event-summary__text">
              <h2 className='event-summary__name'>{event.name}</h2>
              <EventTimes event={event} reverse={true} size="large" />
            </div>
          </div>
        );
      } else {
        contents = (
          <div className="event-summary__text-container">
            <Link to={`/events/${event._id}`} className="event-summary__text">
              <h2 className='event-summary__name'>{event.name}</h2>
              <EventTimes event={event} reverse={true} size="large" />
            </Link>
          </div>
        );
      }

      if (event.address) {
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
        {image}
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
  navigable: PropTypes.bool
};
