"use strict";
import List from '../../components/List';
import MessageItem from './MessageItem';

export default class Messages extends List {};

Messages.defaultProps = {
  ...List.defaultProps,
  category: 'messages',
  filter: 'library',
  Item: MessageItem,
  path: '/messages',
  sort: '-date',
  title: 'Messages'
};
