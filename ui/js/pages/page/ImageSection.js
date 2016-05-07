"use strict";
import React, { PropTypes } from 'react';

const ImageSection = (props) => {
  const { section } = props;
  let classNames = ['page-image__container'];
  if (section.full) {
    classNames.push('page-image__container--full');
  }
  return (
    <div className={classNames.join(' ')}>
      <img className="page-image"
        src={section.image ? section.image.data : ''} />
    </div>
  );
};

ImageSection.defaultProps = {
  section: PropTypes.object.isRequired
};

export default ImageSection;
