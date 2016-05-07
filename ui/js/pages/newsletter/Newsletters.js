"use strict";
import React from 'react';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: newsletter } = props;
  return (
    <div className={className}>
      <span>{newsletter.name}</span>
    </div>
  );
};

export default class Newsletters extends List {};

Newsletters.defaultProps = {
  category: 'newsletters',
  Item: Item,
  path: '/newsletters',
  title: 'Newsletters'
};
