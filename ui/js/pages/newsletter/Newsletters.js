import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: newsletter } = props;
  const classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')} to={`/newsletters/${newsletter._id}`}>
      <div className="item">
        <span className="item__name">
          {moment(newsletter.date).format('MMM Do YYYY')}
        </span>
        <span>{newsletter.name}</span>
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

export default class Newsletters extends List {}

Newsletters.defaultProps = {
  ...List.defaultProps,
  category: 'newsletters',
  Item,
  path: '/newsletters',
  sort: '-date',
  title: 'Newsletters',
};
