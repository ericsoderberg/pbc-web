"use strict";
import React from 'react';
import Show from '../../components/Show';

export default class User extends Show {
  _renderContents (user) {
    return (
      <div>
        <img className="avatar" src={user.avatar ? user.avatar.data : ''} />
        {user.email}
      </div>
    );
  }
};

User.defaultProps = {
  category: 'users'
};
