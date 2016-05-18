"use strict";
import React from 'react';
import { Link } from 'react-router';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: page } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={page.path || `/pages/${page._id}`}>
      <div className="item">
        <span>{page.name}</span>
      </div>
    </Link>
  );
};

export default class Pages extends List {};

Pages.defaultProps = {
  ...List.defaultProps,
  category: 'pages',
  Item: Item,
  path: '/pages',
  title: 'Pages'
};
