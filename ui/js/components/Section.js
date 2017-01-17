"use strict";
import React, { Component, PropTypes, Children } from 'react';
import Image from './Image';
import { isDarkBackground } from '../utils/Color';

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
    const nextActive = (rect.top + 100) < window.innerHeight;
    if (nextActive !== active) {
      this.setState({ active: nextActive });
    }
  }

  render () {
    const {
      align, backgroundImage, className, color, footer, full, plain
    } = this.props;
    let { style } = this.props;
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
      if (color) {
        style = { ...style, backgroundColor: color };
        classNames.push('section__container--colored');
        if (isDarkBackground(color)) {
          classNames.push('dark-background');
        }
      }
      if (align) {
        classNames.push(`section__container--${align}`);
      }
      if (className) {
        classNames.push(className);
      }

      let background;
      if (backgroundImage) {
        background =
          <Image className='section__background' image={backgroundImage} />;
      }

      child = React.cloneElement(child, {
        className: `${child.props.className || ''} section`});

      result = (
        <div ref='component' className={classNames.join(' ')} style={style}>
          {background}
          {child}
        </div>
      );
    }

    return result;
  }
}

Section.propTypes = {
  align: PropTypes.oneOf(['center', 'left', 'right']),
  backgroundImage: PropTypes.shape({
    data: PropTypes.string.isRequired
  }),
  color: PropTypes.string,
  footer: PropTypes.bool,
  full: PropTypes.bool,
  plain: PropTypes.bool
};
