"use strict";
import React from 'react';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: formTemplate } = props;
  return (
    <div className={className}>
      <span>{formTemplate.name}</span>
    </div>
  );
};

export default class FormTemplates extends List {};

FormTemplates.defaultProps = {
  category: 'formTemplates',
  Item: Item,
  path: '/form-templates',
  title: 'Form Templates'
};
