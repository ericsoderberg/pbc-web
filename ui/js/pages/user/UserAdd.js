"use strict";
import Add from '../../components/Add';
import UserFormContents from './UserFormContents';

export default class UserAdd extends Add {};

UserAdd.defaultProps = {
  category: 'users',
  FormContents: UserFormContents,
  title: 'Add User'
};
