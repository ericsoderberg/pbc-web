"use strict";
import Add from '../../components/Add';
import MessageFormContents from './MessageFormContents';
import MessagePreview from './MessagePreview';

export default class MessageAdd extends Add {};

MessageAdd.defaultProps = {
  category: 'messages',
  FormContents: MessageFormContents,
  Preview: MessagePreview,
  showable: true,
  title: 'Add Message'
};
