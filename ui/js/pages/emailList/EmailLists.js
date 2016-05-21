"use strict";
import React from 'react';
import { Link } from 'react-router';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: emailList } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/email-lists/${emailList._id}/edit`}>
      <div className="item">
        <span>{emailList.name}</span>
      </div>
    </Link>
  );
};

export default class EmailLists extends List {};

EmailLists.defaultProps = {
  ...List.defaultProps,
  category: 'email-lists',
  Item: Item,
  path: '/email-lists',
  title: 'Email Lists'
};