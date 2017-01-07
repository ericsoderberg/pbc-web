"use strict";
import React, { Component, PropTypes, Children } from 'react';

export default class Section extends Component {

  constructor () {
    super();
    this._onScroll = this._onScroll.bind(this);
    this._layout = this._layout.bind(this);
    this.state = {};
  }

  componentDidMount () {
    const { plain } = this.props;
    if (! plain) {
      window.addEventListener('scroll', this._onScroll);
      this._layout();
    }
  }

  componentWillUnmount () {
    const { plain } = this.props;
    if (! plain) {
      window.removeEventListener('scroll', this._onScroll);
    }
  }

  _onScroll () {
    // debounce
    clearTimeout(this._scrollTimer);
    this._scrollTimer = setTimeout(this._layout, 10);
  }

  _layout () {
    const { active } = this.state;
    const rect = this.refs.component.getBoundingClientRect();
    const nextActive = (rect.top + 10) < window.innerHeight;
    if (nextActive && nextActive !== active) {
      this.setState({ active: nextActive });
    }
  }

  render () {
    const { color, footer, full, plain } = this.props;
    const { active } = this.state;
    let child = Children.only(this.props.children);

    let result;
    if (plain) {
      result = child;
    } else {
      const classNames = ['section__container'];
      if (full) {
        classNames.push('section__container--full');
      }
      if (footer) {
        classNames.push('section__container--footer');
      }
      if (active) {
        classNames.push('section__container--active');
      }
      let style;
      if (color) {
        style = { backgroundColor: color, color: '#fff' };
        classNames.push('section__container--colored');
      }

      child = React.cloneElement(child, {
        className: `${child.props.className || ''} section`});

      result = (
        <div ref='component' className={classNames.join(' ')} style={style}>
          {child}
        </div>
      );
    }

    return result;
  }
}

Section.propTypes = {
  color: PropTypes.string,
  footer: PropTypes.bool,
  full: PropTypes.bool,
  plain: PropTypes.bool
};
