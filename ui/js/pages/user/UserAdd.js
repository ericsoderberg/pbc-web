"use strict";
import Add from '../../components/Add';
import UserForm from './UserForm';

export default class UserAdd extends Add {};

UserAdd.defaultProps = {
  category: 'users',
  Form: UserForm,
  title: 'Add User'
};
