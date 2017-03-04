import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: user } = props;
  const classNames = ['item__container', className];
  const admin =
    (user.administrator || user.administratorDomainId) ? ' *' : undefined;
  return (
    <Link className={classNames.join(' ')} to={`/users/${user._id}`}>
      <div className="item">
        <span className="box--row">
          <img className="avatar" alt="avatar"
            src={user.image ? user.image.data : ''} />
          <span className="item__name">{user.name}</span>
          <span>{admin}</span>
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
