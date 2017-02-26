"use strict";
import React from 'react';
import { Link } from 'react-router';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: family } = props;
  let classNames = ['item__container', className];
  let adults = family.adults.map(adult =>
    (adult.userId || {}).name || (adult.userId || {}).email);
  let children = family.children.map(child => child.name);
  return (
    <Link className={classNames.join(' ')}
      to={`/families/${family._id}/edit`}>
      <div className="item">
        <span className="item__name">{adults.join(', ')}</span>
        <span className="secondary">{children.join(', ')}</span>
      </div>
    </Link>
  );
};

export default class Families extends List {};

Families.defaultProps = {
  ...List.defaultProps,
  category: 'families',
  Item: Item,
  path: '/families',
  populate: true,
  title: 'Families'
};
