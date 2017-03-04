import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: domain } = props;
  const classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/domains/${domain._id}/edit`}>
      <div className="item">
        <span className="item__name">{domain.name}</span>
      </div>
    </Link>
  );
};

Item.propTypes = {
  className: PropTypes.string,
  item: PropTypes.object.isRequired,
};

Item.defaultProps = {
  className: undefined,
};

export default class Domains extends List {}

Domains.defaultProps = {
  ...List.defaultProps,
  category: 'domains',
  Item,
  path: '/domains',
  title: 'Domains',
};
