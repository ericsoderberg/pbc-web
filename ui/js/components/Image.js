import React from 'react';
import PropTypes from 'prop-types';

const Image = (props) => {
  const { avatar, className, full, image, style } = props;
  const classes = ['image'];
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
    <img className={classes.join(' ')}
      alt=""
      src={image ? (image.data || image.path) : ''}
      style={style} />
  );
};

Image.propTypes = {
  avatar: PropTypes.bool,
  className: PropTypes.string,
  full: PropTypes.bool,
  image: PropTypes.shape({
    data: PropTypes.string,
  }),
  style: PropTypes.object,
};

Image.defaultProps = {
  avatar: false,
  className: undefined,
  full: false,
  image: {},
  style: undefined,
};

export default Image;
