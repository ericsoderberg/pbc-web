"use strict";
import React, { Component, PropTypes } from 'react';

export default class Image extends Component {
  render () {
    const { avatar, className, full, image, style } = this.props;
    let classes = ['image'];
    if (avatar) {
      classes.push('image--avatar');
    }
    if (full) {
      classes.push('image--full');
    }
    if (className) {
      classes.push(className);
    }

    return (
      <img className={classes.join(' ')} src={image ? image.data : ''}
        style={style} />
    );
  }
};

Image.propTypes = {
  avatar: PropTypes.bool,
  full: PropTypes.bool,
  image: PropTypes.shape({
    data: PropTypes.string.isRequired
  })
};
