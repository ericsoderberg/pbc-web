"use strict";
import React, { PropTypes } from 'react';

const Image = (props) => {
  const { full, image } = props;
  let classNames = ['page-image__container'];
  if (full) {
    classNames.push('page-image__container--full');
  }
  return (
    <div className={classNames.join(' ')}>
      <img className="page-image"
        src={image ? image.data : ''} />
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
