"use strict";
import React from 'react';
import { Link } from 'react-router';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: calendar } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/calendars/${calendar.path || calendar._id}`}>
      <div className="item">
        <span className="item__name">{calendar.name}</span>
      </div>
    </Link>
  );
};

export default class Calendars extends List {};

Calendars.defaultProps = {
  ...List.defaultProps,
  category: 'calendars',
  Item: Item,
  path: '/calendars',
  title: 'Calendars'
};
