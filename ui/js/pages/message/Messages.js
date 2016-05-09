"use strict";
import List from '../../components/List';
import MessageItem from './MessageItem';

export default class Messages extends List {};

Messages.defaultProps = {
  category: 'messages',
  Item: MessageItem,
  path: '/messages',
  title: 'Messages'
};
