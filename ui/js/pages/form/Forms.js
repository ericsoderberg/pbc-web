"use strict";
import React from 'react';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: form } = props;
  return (
    <div className={className}>
      <span>{form.name}</span>
    </div>
  );
};

export default class Forms extends List {};

Forms.defaultProps = {
  category: 'forms',
  Item: Item,
  path: '/forms',
  title: 'Forms'
};
