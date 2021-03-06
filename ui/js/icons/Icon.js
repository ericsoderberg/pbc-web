import React, { Component } from 'react';
import PropTypes from 'prop-types';

// cannot be a function because we extend it for other icons
export default class Icon extends Component {

  render() {
    const { pathCommands, children, className, color, secondary } = this.props;
    const classNames = ['control-icon'];
    if (secondary) {
      classNames.push('control-icon--secondary');
    }
    if (className) {
      classNames.push(className);
    }
    let contents;
    if (pathCommands) {
      contents = (
        <path fill="none"
          strokeWidth="2"
          strokeMiterlimit="10"
          d={pathCommands} />
      );
    } else if (children) {
      contents = children;
    }
    return (
      <svg version="1.1"
        viewBox="0 0 24 24"
        width="24px"
        height="24px"
        role="img"
        className={classNames.join(' ')}>
        <g stroke={color}>
          <rect x="0" y="0" fill="none" stroke="none" width="24" height="24" />
          {contents}
        </g>
      </svg>
    );
  }
}

Icon.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  color: PropTypes.string,
  pathCommands: PropTypes.string,
  secondary: PropTypes.bool,
};

Icon.defaultProps = {
  children: undefined,
  className: undefined,
  color: undefined,
  pathCommands: undefined,
  secondary: undefined,
};
