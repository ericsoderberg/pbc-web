"use strict";
import React from 'react';
import Items from '../../components/Items';

const Item = (props) => {
  const { className, item: message } = props;
  return (
    <div className={className}>
      <span>{message.name}</span>
    </div>
  );
};

export default class Messages extends Items {};

Messages.defaultProps = {
  category: 'messages',
  Item: Item,
  path: '/messages',
  title: 'Messages'
};
