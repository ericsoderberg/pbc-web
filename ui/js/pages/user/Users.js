import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';
import List from '../../components/List';
import UserIcon from '../../icons/User';

const Item = (props) => {
  const { className, item: user } = props;
  const classNames = ['item__container'];
  if (className) {
    classNames.push(className);
  }
  let avatar;
  if (user.image) {
    avatar = <img className="avatar" alt="avatar" src={user.image.data} />;
  } else {
    avatar = <UserIcon className="avatar" />;
  }
  return (
    <Link className={classNames.join(' ')} to={`/users/${user._id}`}>
      <div className="item">
        <span className="box--row">
          {avatar}
          <span className="item__name">{user.name}</span>
        </span>
        <span>{user.email}</span>
      </div>
    </Link>
  );
};

Item.propTypes = {
  className: PropTypes.string,
  item: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
};

Item.defaultProps = {
  className: undefined,
};

export default class Users extends List {}

Users.defaultProps = {
  ...List.defaultProps,
  category: 'users',
  Item,
  path: '/users',
  sort: 'name email',
  title: 'People',
};
