"use strict";
import React from 'react';
import Items from '../../components/Items';

const Item = (props) => {
  const { className, item: form } = props;
  return (
    <div className={className}>
      <span>{form.name}</span>
    </div>
  );
};

export default class Forms extends Items {};

Forms.defaultProps = {
  category: 'forms',
  Item: Item,
  path: '/forms',
  title: 'Forms'
};
