"use strict";
import React from 'react';
import moment from 'moment';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: message } = props;
  return (
    <div className={className}>
      <span>{message.name}</span>
      <span className="box--row">
        <span>{message.verses}</span>
        <span>{moment(message.date).format('M/D/YYYY')}</span>
      </span>
    </div>
  );
};

export default class Messages extends List {};

Messages.defaultProps = {
  category: 'messages',
  Item: Item,
  path: '/messages',
  title: 'Messages'
};
