"use strict";
import React from 'react';
import Items from '../../components/Items';

const Item = (props) => {
  const { className, item: user } = props;
  const admin = user.administrator ? ' *' : undefined;
  return (
    <div className={className}>
      <span className="box--row">
        <img className="avatar" src={user.avatar ? user.avatar.data : ''} />
        <span>{user.name}</span>
        <span>{admin}</span>
      </span>
      <span>{user.email}</span>
    </div>
  );
};

export default class Users extends Items {};

Users.defaultProps = {
  category: 'users',
  Item: Item,
  path: '/users',
  title: 'Users'
};
