"use strict";
import React from 'react';
import { Link } from 'react-router';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: user } = props;
  let classNames = ['item__container', className];
  const admin =
    (user.administrator || user.administratorDomainId) ? ' *' : undefined;
  return (
    <Link className={classNames.join(' ')} to={`/users/${user._id}`}>
      <div className="item">
        <span className="box--row">
          <img className="avatar" src={user.avatar ? user.avatar.data : ''} />
          <span className="item__name">{user.name}</span>
          <span>{admin}</span>
        </span>
        <span>{user.email}</span>
      </div>
    </Link>
  );
};

export default class Users extends List {};

Users.defaultProps = {
  ...List.defaultProps,
  category: 'users',
  Item: Item,
  path: '/users',
  title: 'People'
};
