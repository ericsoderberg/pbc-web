"use strict";
import React from 'react';
import { Link } from 'react-router';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: formTemplate } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/form-templates/${formTemplate._id}/edit`}>
      <div className="item">
        <span>{formTemplate.name}</span>
      </div>
    </Link>
  );
};

export default class FormTemplates extends List {};

FormTemplates.defaultProps = {
  ...List.defaultProps,
  category: 'form-templates',
  Item: Item,
  path: '/form-templates',
  title: 'Form Templates'
};
