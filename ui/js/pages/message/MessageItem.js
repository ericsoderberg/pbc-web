"use strict";
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';

const MessageItem = (props) => {
  const message = props.item;
  let classNames = ['item__container'];
  if (props.className) {
    classNames.push(props.className);
  }
  return (
    <Link className={classNames.join(' ')} to={`/messages/${message._id}`}>
      <div className="item">
        <span>{message.name}</span>
        <span className="box--row">
          <span>{message.verses}</span>
          <span>{moment(message.date).format('MMM Do YYYY')}</span>
        </span>
      </div>
    </Link>
  );
};

MessageItem.defaultProps = {
  item: PropTypes.object.isRequired
};

export default MessageItem;
