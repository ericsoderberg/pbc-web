"use strict";
import React from 'react';
import Items from '../../components/Items';

const Item = (props) => {
  const { className, item: event } = props;
  return (
    <div className={className}>
      <span>{event.name}</span>
    </div>
  );
};

export default class Events extends Items {};

Events.defaultProps = {
  category: 'events',
  Item: Item,
  path: '/events',
  title: 'Events'
};
