"use strict";
import React from 'react';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: resource } = props;
  return (
    <div className={className}>
      <span>{resource.name}</span>
    </div>
  );
};

export default class Resources extends List {};

Resources.defaultProps = {
  category: 'resources',
  Item: Item,
  path: '/resources',
  title: 'Resources'
};
