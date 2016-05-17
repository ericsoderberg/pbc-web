"use strict";
import Edit from '../../components/Edit';
import EmailListFormContents from './EmailListFormContents';

export default class EmailListEdit extends Edit {};

EmailListEdit.defaultProps = {
  category: 'email-lists',
  FormContents: EmailListFormContents,
  title: 'Edit Email List'
};
