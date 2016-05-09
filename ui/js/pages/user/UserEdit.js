"use strict";
import Edit from '../../components/Edit';
import UserFormContents from './UserFormContents';

export default class UserEdit extends Edit {};

UserEdit.defaultProps = {
  category: 'users',
  FormContents: UserFormContents,
  title: 'Edit Person'
};
