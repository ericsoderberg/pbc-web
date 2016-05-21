"use strict";
import React from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: form } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/forms/${form._id}/edit`}>
      <div className="item">
        <span className="box--row">
          <span>{form.formTemplateId.name}</span>
          <span>{form.userId.name}</span>
        </span>
        <span>{moment(form.modified).format('MMM Do YYYY')}</span>
      </div>
    </Link>
  );
};

export default class Forms extends List {};

Forms.defaultProps = {
  ...List.defaultProps,
  category: 'forms',
  Item: Item,
  path: '/forms',
  populate: [
    { path: 'formTemplateId', select: 'name' },
    { path: 'userId', select: 'name' }
  ],
  title: 'Forms'
};
