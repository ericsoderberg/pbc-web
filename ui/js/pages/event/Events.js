"use strict";
import React from 'react';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: event } = props;
  return (
    <div className={className}>
      <span>{event.name}</span>
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
