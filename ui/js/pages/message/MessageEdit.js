"use strict";
import Edit from '../../components/Edit';
import MessageFormContents from './MessageFormContents';
import MessagePreview from './MessagePreview';

export default class MessageEdit extends Edit {};

MessageEdit.defaultProps = {
  category: 'messages',
  FormContents: MessageFormContents,
  Preview: MessagePreview,
  title: 'Edit Message'
};
