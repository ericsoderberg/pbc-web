import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: resource } = props;
  const classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/resources/${resource._id}`}>
      <div className="item">
        <span className="item__name">{resource.name}</span>
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

export default class Resources extends List {}

Resources.defaultProps = {
  ...List.defaultProps,
  actions: [<Link key="calendar" to="/resources/calendar">Calendar</Link>],
  category: 'resources',
  Item,
  path: '/resources',
  title: 'Resources',
};
