"use strict";
import React from 'react';
import Items from '../../components/Items';

const Item = (props) => {
  const { className, item: page } = props;
  return (
    <div className={className}>
      <span>{page.name}</span>
    </div>
  );
};

export default class Pages extends Items {};

Pages.defaultProps = {
  category: 'pages',
  Item: Item,
  path: '/pages',
  title: 'Pages'
};
