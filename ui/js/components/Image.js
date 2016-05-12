"use strict";
import React, { PropTypes } from 'react';

const Image = (props) => {
  const { full, image } = props;
  let classNames = ['section__container'];
  if (full) {
    classNames.push('section__container--full');
  }
  return (
    <div className={classNames.join(' ')}>
      <img className="image section" src={image ? image.data : ''} />
    </div>
  );
};

Image.propTypes = {
  full: PropTypes.bool,
  image: PropTypes.shape({
    data: PropTypes.string.isRequired
  })
};

export default Image;
