"use strict";
import React from 'react';
import { Link } from 'react-router';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: library } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/libraries/${library.path || library._id}`}>
      <div className="item">
        <span className="item__name">{library.name}</span>
      </div>
    </Link>
  );
};

export default class Libraries extends List {};

Libraries.defaultProps = {
  ...List.defaultProps,
  category: 'libraries',
  Item: Item,
  path: '/libraries',
  title: 'Libraries'
};
