
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: family } = props;
  const classNames = ['item__container', className];
  const adults = family.adults.map(adult =>
    (adult.userId || {}).name || (adult.userId || {}).email);
  const children = family.children.map(child => child.name);
  return (
    <Link className={classNames.join(' ')}
      to={`/families/${family._id}/edit`}>
      <div className="item">
        <span className="item__name">{adults.join(', ')}</span>
        <span className="secondary">{children.join(', ')}</span>
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

export default class Families extends List {}

Families.defaultProps = {
  ...List.defaultProps,
  category: 'families',
  Item,
  path: '/families',
  populate: true,
  title: 'Families',
};
