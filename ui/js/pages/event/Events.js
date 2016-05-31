"use strict";
import React from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import List from '../../components/List';
import EventTimes from '../../components/EventTimes';

const Item = (props) => {
  const { className, item: event } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/events/${event.path || event._id}`}>
      <div className="item">
        <span>{event.name}</span>
        <EventTimes event={event} />
      </div>
    </Link>
  );
};

export default class Events extends List {};

Events.defaultProps = {
  ...List.defaultProps,
  category: 'events',
  Item: Item,
  marker: {
    property: 'start',
    value: (new Date()).toISOString(),
    label: (
      <div className="marker">
        <span>Today</span><span>{moment().format('MMM Do YYYY')}</span>
      </div>
    )
  },
  path: '/events',
  sort: '-start',
  title: 'Events'
};
