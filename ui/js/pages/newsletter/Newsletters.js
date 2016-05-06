"use strict";
import React from 'react';
import Items from '../../components/Items';

const Item = (props) => {
  const { className, item: newsletter } = props;
  return (
    <div className={className}>
      <span>{newsletter.name}</span>
    </div>
  );
};

export default class Newsletters extends Items {};

Newsletters.defaultProps = {
  category: 'newsletters',
  Item: Item,
  path: '/newsletters',
  title: 'Newsletters'
};
