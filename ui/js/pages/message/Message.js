"use strict";
import Show from '../../components/Show';
import MessageContents from './MessageContents';

export default class Message extends Show {};

Message.defaultProps = {
  category: 'messages',
  Contents: MessageContents,
  title: 'Message'
};
