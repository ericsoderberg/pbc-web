"use strict";
import React from 'react';
import moment from 'moment';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: event } = props;
  return (
    <div className={className}>
      <span>{event.name}</span>
      <span className="box--row">
        {moment(event.start).format('M/D/YYYY h:mm a')}
      </span>
    </div>
  );
};

export default class Events extends List {};

Events.defaultProps = {
  category: 'events',
  Item: Item,
  path: '/events',
  title: 'Events'
};
