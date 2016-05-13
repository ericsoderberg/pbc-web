"use strict";
import React from 'react';
import moment from 'moment';
import List from '../../components/List';
import MessageItem from './MessageItem';

export default class Messages extends List {};

Messages.defaultProps = {
  ...List.defaultProps,
  category: 'messages',
  filter: 'library',
  Item: MessageItem,
  marker: {
    property: 'date',
    value: (new Date()).toISOString(),
    label: (
      <div className="marker">
        <span>Today</span><span>{moment().format('MMM Do YYYY')}</span>
      </div>
    )
  },
  path: '/messages',
  sort: '-date',
  title: 'Messages'
};
