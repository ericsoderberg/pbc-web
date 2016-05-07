"use strict";
import React, { PropTypes } from 'react';

const ImageSection = (props) => {
  const { section } = props;
  return (
    <img className="page__image"
      src={section.image ? section.image.data : ''} />
  );
};

ImageSection.defaultProps = {
  section: PropTypes.object.isRequired
};

export default ImageSection;
