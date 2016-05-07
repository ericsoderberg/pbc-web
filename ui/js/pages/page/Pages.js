"use strict";
import React from 'react';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: page } = props;
  return (
    <div className={className}>
      <span>{page.name}</span>
    </div>
  );
};

export default class Pages extends List {};

Pages.defaultProps = {
  category: 'pages',
  Item: Item,
  path: '/pages',
  title: 'Pages'
};
