
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Button extends Component {

  constructor() {
    super();
    this._layout = this._layout.bind(this);
    this._onClick = this._onClick.bind(this);
    this.state = {};
  }

  componentDidMount() {
    const { left, right } = this.props;
    if (left || right) {
      this._layout();
    }
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.left || nextProps.right) &&
      nextProps.label !== this.props.label) {
      this._needLayout = true;
    }
  }

  componentDidUpdate() {
    if (this._needLayout) {
      this._needLayout = false;
      this._layout();
    }
  }

  _layout() {
    // avoid sub-pixel label width for left/right buttons
    setTimeout(() => {
      const width = this._componentRef.offsetWidth;
      // align to even pixels to avoid gap, who knows why
      this.setState({ width: width + (width % 2) });
    }, 10);
  }

  _onClick(event) {
    const { path, replaceHistory } = this.props;
    const { router } = this.context;
    event.preventDefault();
    if (replaceHistory) {
      router.history.replace(path);
    } else {
      router.history.push(path);
    }
  }

  render() {
    const {
      children, circle, className, icon, label, left, path, plain, right,
      secondary, tag, type,
    } = this.props;
    const { width } = this.state;
    const { router } = this.context;
    const Tag = tag || (path ? 'a' : 'button');

    const classNames = [];
    let contents = label || icon || children;
    let arrow;
    const style = this.props.style ? { ...this.props.style } : {};
    if (circle) {
      classNames.push('button-circle');
      contents = <span className="button__label">{contents}</span>;
    } else if (left) {
      classNames.push('button-left');
      arrow = (
        <svg viewBox="0 0 24 24"
          preserveAspectRatio="none"
          width="24"
          className="button__arrow">
          <path d="M24,0 L24,24 L0,12 Z" />
        </svg>
      );
      if (width) {
        style.minWidth = width;
      }
      contents = (
        <span className="button__label">{contents}</span>
      );
    } else if (right) {
      classNames.push('button-right');
      arrow = (
        <svg viewBox="0 0 24 24"
          preserveAspectRatio="none"
          width="24"
          className="button__arrow">
          <path d="M0,0 L24,12 L0,24 Z" />
        </svg>
      );
      if (width) {
        style.minWidth = width;
      }
      contents = (
        <span className="button__label">{contents}</span>
      );
    } else if (icon && !label) {
      classNames.push('button-icon');
    } else if (plain) {
      classNames.push('button-plain');
    } else {
      classNames.push('button');
    }
    if (secondary) {
      classNames.push('button--secondary');
    }
    if (className) {
      classNames.push(className);
    }

    let href;
    let onClick;
    if (this.props.onClick) {
      onClick = this.props.onClick;
    } else if (this.props.path) {
      href = router.history.createHref({ pathname: this.props.path });
      onClick = this._onClick;
    }

    return (
      <Tag ref={(ref) => { this._componentRef = ref; }}
        className={classNames.join(' ')}
        href={href}
        type={Tag === 'button' ? type : undefined}
        onClick={onClick}
        style={style}>
        {contents}
        {arrow}
      </Tag>
    );
  }
}

Button.propTypes = {
  children: PropTypes.any,
  circle: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.node,
  label: PropTypes.node,
  left: PropTypes.bool,
  onClick: PropTypes.func,
  path: PropTypes.string,
  plain: PropTypes.bool,
  replaceHistory: PropTypes.bool,
  right: PropTypes.bool,
  secondary: PropTypes.bool,
  style: PropTypes.object,
  tag: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit']),
};

Button.defaultProps = {
  children: undefined,
  circle: false,
  className: undefined,
  icon: undefined,
  label: undefined,
  left: false,
  onClick: undefined,
  path: undefined,
  plain: false,
  replaceHistory: false,
  right: false,
  secondary: false,
  style: undefined,
  tag: undefined,
  type: 'button',
};

Button.contextTypes = {
  router: PropTypes.any,
};
