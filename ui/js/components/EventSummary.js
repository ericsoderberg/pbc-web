"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { getItem } from '../actions';
import Map from './Map';

export default class EventSummary extends Component {

  constructor () {
    super();
    this.state = { event: {} };
  }

  componentDidMount () {
    getItem('events', this.props.id)
    .then(event => this.setState({ event: event }))
    .catch(error => console.log('!!! EventSummary catch', error));
  }

  render () {
    const { event } = this.state;
    return (
      <div className="section__container">
        <div className="event-summary section">
          <Link to={`/events/${event._id}`} className="event-summary__summary">
            <h2>{event.name}</h2>
            <span className="event-summary__date">
              {moment(event.start).format('MMMM Do YYYY @ h:mm a')}
            </span>
          </Link>
          <div className="event-summary__map">
            <Map address={event.address || ''} plain={true} />
          </div>
        </div>
      </div>
    );
  }
};

EventSummary.propTypes = {
  id: PropTypes.string.isRequired
};
