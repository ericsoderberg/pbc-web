import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import EventTimes from './EventTimes';

const EventItem = (props) => {
  const { align, className, item: event } = props;
  const classNames = ['item__container', className];
  const itemClassNames = ['item'];
  if (align) {
    itemClassNames.push(`item--${align}`);
  }
  return (
    <Link className={classNames.join(' ')}
      to={`/events/${event.path || event._id}`}>
      <div className={itemClassNames.join(' ')}>
        <span className="item__name">{event.name}</span>
        <EventTimes event={event} />
      </div>
    </Link>
  );
};

EventItem.propTypes = {
  align: PropTypes.oneOf(['start', 'center', 'end']),
  className: PropTypes.string,
  item: PropTypes.object.isRequired,
};

EventItem.defaultProps = {
  align: undefined,
  className: undefined,
};

export default EventItem;
