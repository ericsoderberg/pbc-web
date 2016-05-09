"use strict";
import React, { PropTypes } from 'react';
import moment from 'moment';
import Text from '../../components/Text';
import Image from '../../components/Image';

const MessageContents = (props) => {
  const message = props.item;

  let text;
  if (message.text) {
    text = <Text text={message.text} />;
  }

  let image;
  if (message.image) {
    image = <Image image={message.image} full={true} />;
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
