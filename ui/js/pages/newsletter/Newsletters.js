"use strict";
import React from 'react';
import { Link } from 'react-router';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: newsletter } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')} to={`/newsletters/${newsletter._id}`}>
      <div className="item">
        <span>{newsletter.name}</span>
      </div>
    </Link>
  );
};

export default class Newsletters extends List {};

Newsletters.defaultProps = {
  category: 'newsletters',
  Item: Item,
  path: '/newsletters',
  title: 'Newsletters'
};
