import React from 'react';
import PropTypes from 'prop-types';

const User = (props) => {
  const { className } = props;
  const classNames = [];
  if (className) {
    classNames.push(className);
  }
  return (
    <svg version="1.1"
      viewBox="0 0 24 24"
      width="24px"
      height="24px"
      role="img"
      className={classNames.join(' ')}>
      <circle cx="12" cy="10" r="8" fill="#ddd" />
      <circle cx="12" cy="28" r="10" fill="#ddd" />
    </svg>
  );
};

User.propTypes = {
  className: PropTypes.string,
};

User.defaultProps = {
  className: undefined,
};

export default User;
