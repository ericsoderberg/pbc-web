"use strict";
import React from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: formTemplate } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/form-templates/${formTemplate._id}`}>
      <div className="item">
        <span className="item__name">{formTemplate.name}</span>
        <span>{moment(formTemplate.modified).format('MMM Do YYYY')}</span>
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
  select: 'name modified',
  sort: '-modified',
  title: 'Form Templates'
};
