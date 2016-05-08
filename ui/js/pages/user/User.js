"use strict";
import React from 'react';
import Show from '../../components/Show';

const UserContents = (props) => {
  const user = props.item;
  return (
    <div>
      <img className="avatar" src={user.avatar ? user.avatar.data : ''} />
      {user.email}
    </div>
  );
};

export default class User extends Show {};

User.defaultProps = {
  category: 'users',
  Contents: UserContents
};
