"use strict";
import React, { Component, PropTypes } from 'react';

export default class Button extends Component {

  constructor () {
    super();
    this._layout = this._layout.bind(this);
    this._onClick = this._onClick.bind(this);
    this.state = {};
  }

  componentDidMount () {
    const { left, right } = this.props;
    if (left || right) {
      this._layout();
    }
  }

  componentWillReceiveProps (nextProps) {
    if ((nextProps.left || nextProps.right) &&
      nextProps.label !== this.props.label) {
      this.setState({ needLayout: true });
    }
  }

  componentDidUpdate () {
    const { needLayout } = this.state;
    if (needLayout) {
      this.setState({ needLayout: false }, this._layout);
    }
  }

  _layout () {
    // avoid sub-pixel label width for left/right buttons
    setTimeout(() => {
      const element = this.refs.component;
      const width = element.offsetWidth;
      // align to even pixels to avoid gap, who knows why
      this.setState({ width: width + (width % 2) });
    }, 10);
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
    const { children, circle, className, icon, label, left, path, plain, right,
      secondary, tag, type
    } = this.props;
    const { width } = this.state;
    const Tag = tag || (path ? 'a' : 'button');

    let classNames = [];
    let contents = label || icon || children;
    let arrow;
    let style = this.props.style ? { ...this.props.style } : {};
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
      if (width) {
        style.minWidth = width;
      }
      contents = (
        <span ref="label" className="button__label">{contents}</span>
      );
    } else if (right) {
      classNames.push('button-right');
      arrow = (
        <svg viewBox='0 0 24 24' preserveAspectRatio='none'
          className="button__arrow">
          <path d='M0,0 L24,12 L0,24 Z' />
        </svg>
      );
      if (width) {
        style.minWidth = width;
      }
      contents = (
        <span ref="label" className="button__label">{contents}</span>
      );
    } else if (icon) {
      classNames.push('button-icon');
    } else if (plain) {
      classNames.push('button-plain');
    } else {
      classNames.push(`button`);
    }
    if (secondary) {
      classNames.push('button--secondary');
    }
    if (className) {
      classNames.push(className);
    }

    let href, onClick;
    if (this.props.onClick) {
      onClick = this.props.onClick;
    } else if (this.props.path) {
      href = this.context.router.createPath(this.props.path);
      onClick = this._onClick;
    }

    return (
      <Tag ref="component" className={classNames.join(' ')}
        href={href} type={type} onClick={onClick} style={style}>
        {contents}
        {arrow}
      </Tag>
    );
  }
};

Button.propTypes = {
  circle: PropTypes.bool,
  icon: PropTypes.node,
  label: PropTypes.node,
  left: PropTypes.bool,
  onClick: PropTypes.func,
  path: PropTypes.string,
  plain: PropTypes.bool,
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
