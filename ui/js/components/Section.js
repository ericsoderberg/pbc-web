"use strict";
import React, { PropTypes, Children } from 'react';

const Section = (props) => {
  const { color, full, plain } = props;
  let child = Children.only(props.children);

  let result;
  if (plain) {
    result = child;
  } else {
    const classNames = ['section__container'];
    if (full) {
      classNames.push('section__container--full');
    }
    let style;
    if (color) {
      style = { backgroundColor: color, color: '#fff' };
    }

    child = React.cloneElement(child, {
      className: `${child.props.className} section`});

    result = (
      <div className={classNames.join(' ')} style={style}>
        {child}
      </div>
    );
  }

  return result;
};

Section.propTypes = {
  color: PropTypes.string,
  full: PropTypes.bool,
  plain: PropTypes.bool
};

export default Section;
