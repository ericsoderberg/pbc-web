"use strict";
import React, { PropTypes } from 'react';
import moment from 'moment';
import TextSection from '../page/TextSection';
import ImageSection from '../page/ImageSection';

const MessageContents = (props) => {
  const message = props.item;

  let text;
  if (message.text) {
    const section = { text: message.text };
    text = <TextSection section={section} />;
  }

  let image;
  if (message.image) {
    const section = { image: message.image, full: true };
    image = <ImageSection section={section} />;
  }

  return (
    <div>
      {image}
      {text}
      <dl className="page-attributes">
        <dt>Verses</dt><dd>{message.verses}</dd>
        <dt>Author</dt><dd>{message.author}</dd>
        <dt>Date</dt><dd>{moment(message.date).format('M/D/YYYY')}</dd>
      </dl>
    </div>
  );
};

MessageContents.PropTypes = {
  item: PropTypes.object.isRequired
};

export default MessageContents;
