"use strict";
import React from 'react';
import Show from '../../components/Show';
import TextSection from '../page/TextSection';
import ImageSection from '../page/ImageSection';

const UserContents = (props) => {
  const user = props.item;

  let text;
  if (user.text) {
    const section = { text: user.text };
    text = <TextSection section={section} />;
  }

  let image;
  if (user.avatar) {
    const section = { image: user.avatar, full: false };
    image = <ImageSection section={section} />;
  }

  return (
    <div>
      {image}
      {text}
      <div className="page-text__container">
        <div className="page-text">
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
