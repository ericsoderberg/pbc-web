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

  let email = `
  ## Email
  [${user.email}](mailto:${user.email})
  `;

  return (
    <div>
      {image}
      {text}
      <Text text={email} />
    </div>
  );
};

export default class User extends Show {};

User.defaultProps = {
  category: 'users',
  Contents: UserContents
};
