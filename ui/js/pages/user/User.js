"use strict";
import React from 'react';
import Show from '../../components/Show';
import Text from '../../components/Text';
import Image from '../../components/Image';

const UserContents = (props) => {
  const user = props.item;

  let text;
  if (user.text) {
    text = <Text text={user.text} />;
  }

  let image;
  if (user.image) {
    image = <Image image={user.image} avatar={true} />;
  }

  return (
    <div>
      {image}
      {text}
      <div className="section__container">
        <div className="text section">
          <h2>Email</h2>
          <a href={`mailto:${user.email}`}>{user.email}</a>
        </div>
      </div>
    </div>
  );
};

export default class User extends Show {};

User.defaultProps = {
  category: 'users',
  Contents: UserContents
};
