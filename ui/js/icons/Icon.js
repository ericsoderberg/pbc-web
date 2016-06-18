"use strict";
import React, { Component, PropTypes } from 'react';

export default class Icon extends Component {
  render () {
    const { pathCommands, children, secondary } = this.props;
    let classNames = ['control-icon'];
    if (secondary) {
      classNames.push('control-icon--secondary');
    }
    let contents;
    if (pathCommands) {
      contents = (
        <path fill="none"
          strokeWidth="2" strokeMiterlimit="10" d={pathCommands}/>
      );
    } else if (children) {
      contents = children;
    }
    return (
      <svg version="1.1" viewBox="0 0 24 24" width="24px" height="24px"
        role="img" className={classNames.join(' ')}>
        <g>
          <rect x="0" y="0" fill="none" stroke="none" width="24" height="24"/>
          {contents}
        </g>
      </svg>
    );
  }
};

Icon.propTypes = {
  pathCommands: PropTypes.string,
  secondary: PropTypes.bool
};
