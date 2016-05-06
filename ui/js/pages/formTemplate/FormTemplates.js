"use strict";
import React from 'react';
import Items from '../../components/Items';

const Item = (props) => {
  const { className, item: formTemplate } = props;
  return (
    <div className={className}>
      <span>{formTemplate.name}</span>
    </div>
  );
};

export default class FormTemplates extends Items {};

FormTemplates.defaultProps = {
  category: 'formTemplates',
  Item: Item,
  path: '/form-templates',
  title: 'Form Templates'
};
