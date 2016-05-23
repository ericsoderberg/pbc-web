"use strict";
import React from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: newsletter } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')} to={`/newsletters/${newsletter._id}/edit`}>
      <div className="item">
        <span>{newsletter.name}</span>
        <span>{moment(newsletter.date).format('MMM Do YYYY')}</span>
      </div>
    </Link>
  );
};

export default class Newsletters extends List {};

Newsletters.defaultProps = {
  ...List.defaultProps,
  category: 'newsletters',
  Item: Item,
  path: '/newsletters',
  sort: '-date',
  title: 'Newsletters'
};
