"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import EventTimes from '../../components/EventTimes';
import Section from '../../components/Section';
import Image from '../../components/Image';
import Map from '../../components/Map';
import Button from '../../components/Button';
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
    const { color, full, plain, navigable } = this.props;
    const { event } = this.state;

    let image, contents, map;
    if (event) {

      if (event.image) {
        image = (
          <Image image={event.image} full={false} plain={true} />
        );
      }

      if (false === navigable) {
        contents = (
          <div className="event-summary__summary">
            <h2>{event.name}</h2>
            <EventTimes event={event} reverse={true} size="large" />
          </div>
        );
      } else {
        contents = (
          <Link to={`/events/${event._id}`} className="event-summary__summary">
            <Button right={true}>{event.name}</Button>
            <EventTimes event={event} reverse={true} size="large" />
          </Link>
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
      <Section color={color} full={full} plain={plain}>
        <div className="event-summary">
          {image}
          <div className="event-summary__contents">
            {contents}
            {map}
          </div>
        </div>
      </Section>
    );
  }
};

EventSummary.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  navigable: PropTypes.bool,
  ...Section.propTypes
};
