"use strict";
import Edit from '../../components/Edit';
import UserForm from './UserForm';

export default class UserEdit extends Edit {};

UserEdit.defaultProps = {
  category: 'users',
  Form: UserForm,
  title: 'Edit User'
};
