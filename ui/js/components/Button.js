"use strict";
import React, { Component, PropTypes } from 'react';

export default class Button extends Component {

  constructor () {
    super();
    this._onClick = this._onClick.bind(this);
  }

  _onClick (event) {
    event.preventDefault();
    if (this.props.replaceHistory) {
      this.context.router.replace(this.props.path);
    } else {
      this.context.router.push(this.props.path);
    }
  }

  render () {
    const { children, circle, label, left, path, right, secondary,
      tag } = this.props;
    const Tag = tag || (path ? 'a' : 'button');

    let classNames = [];
    let contents = label || children;
    let arrow;
    if (circle) {
      classNames.push('button-circle');
      contents = <span className="button__label">{contents}</span>;
    } else if (left) {
      classNames.push('button-left');
      arrow = (
        <svg viewBox='0 0 24 24' preserveAspectRatio='none'
          className="button__arrow">
          <path d='M24,0 L24,24 L0,12 Z' />
        </svg>
      );
    } else if (right) {
      classNames.push('button-right');
      arrow = (
        <svg viewBox='0 0 24 24' preserveAspectRatio='none'
          className="button__arrow">
          <path d='M0,0 L24,12 L0,24 Z' />
        </svg>
      );
    }
    if (secondary) {
      classNames.push('button--secondary');
    }

    let href, onClick;
    if (this.props.onClick) {
      onClick = this.props.onClick;
    } else if (this.props.path) {
      href = this.context.router.createPath(this.props.path);
      onClick = this._onClick;
    }

    return (
      <Tag className={classNames.join(' ')} href={href} onClick={onClick}>
        {contents}
        {arrow}
      </Tag>
    );
  }
};

Button.propTypes = {
  circle: PropTypes.bool,
  label: PropTypes.node,
  left: PropTypes.bool,
  onClick: PropTypes.func,
  path: PropTypes.string,
  replaceHistory: PropTypes.bool,
  right: PropTypes.bool,
  secondary: PropTypes.bool,
  tag: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit'])
};

Button.defaultProps = {
  type: 'button'
};

Button.contextTypes = {
  router: PropTypes.object.isRequired
};
