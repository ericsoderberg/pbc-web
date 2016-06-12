"use strict";
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import MessageContents from './MessageContents';

const MessageItem = (props) => {
  const message = props.item;
  let classNames = ['item__container'];
  if (props.className) {
    classNames.push(props.className);
  }
  const date = moment(message.date);

  const link = (
    <Link className={classNames.join(' ')}
      to={`/messages/${message.path || message._id}`}>
      <div className="item">
        <span>{message.name}</span>
        <span className="box--row">
          <span>{message.verses}</span>
          <span className="tertiary">{date.format('MMM Do YYYY')}</span>
        </span>
      </div>
    </Link>
  );

  let contents = link;
  const now = moment();
  if (date.isBetween(now, moment(now).add(7, 'days'), 'day')) {
    contents = (
      <div className="item--primary">
        {link}
        <MessageContents item={message} attributes={false} />
      </div>
    );
  }

  return contents;
};

MessageItem.defaultProps = {
  item: PropTypes.object.isRequired
};

export default MessageItem;
