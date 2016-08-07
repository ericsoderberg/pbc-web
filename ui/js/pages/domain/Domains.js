"use strict";
import React from 'react';
import { Link } from 'react-router';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: domain } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/domains/${domain._id}/edit`}>
      <div className="item">
        <span className="item__name">{domain.name}</span>
      </div>
    </Link>
  );
};

export default class Domains extends List {};

Domains.defaultProps = {
  ...List.defaultProps,
  category: 'domains',
  Item: Item,
  path: '/domains',
  title: 'Domains'
};
