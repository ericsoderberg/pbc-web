"use strict";
import React from 'react';
import { Link } from 'react-router';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: resource } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')} to={`/resources/${resource._id}`}>
      <div className="item">
        <span>{resource.name}</span>
      </div>
    </Link>
  );
};

export default class Resources extends List {};

Resources.defaultProps = {
  category: 'resources',
  Item: Item,
  path: '/resources',
  title: 'Resources'
};
