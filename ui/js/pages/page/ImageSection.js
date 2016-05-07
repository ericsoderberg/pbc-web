"use strict";
import React, { PropTypes } from 'react';

const ImageSection = (props) => {
  const { section } = props;
  return (
    <div className="page-image__container">
      <img className="page-image"
        src={section.image ? section.image.data : ''} />
    </div>
  );
};

ImageSection.defaultProps = {
  section: PropTypes.object.isRequired
};

export default ImageSection;
