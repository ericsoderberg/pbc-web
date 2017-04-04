import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import List from '../../components/List';
import EventTimes from './EventTimes';

const Item = (props) => {
  const { className, item: event } = props;
  const classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/events/${event.path || event._id}`}>
      <div className="item">
        <span className="item__name">{event.name}</span>
        <EventTimes event={event} />
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

export default class Events extends List {}

Events.defaultProps = {
  ...List.defaultProps,
  category: 'events',
  Item,
  marker: {
    property: 'start',
    value: (new Date()).toISOString(),
    label: (
      <div className="marker">
        <span>Today</span><span>{moment().format('MMM Do YYYY')}</span>
      </div>
    ),
  },
  path: '/events',
  sort: '-modified',
  title: 'Events',
};
