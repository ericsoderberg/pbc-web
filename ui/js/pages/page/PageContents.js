"use strict";
import React, { PropTypes } from 'react';
import Text from '../../components/Text';
import Image from '../../components/Image';

const PageContents = (props) => {
  const page = props.item;
  const sections = (page.sections || []).map((section, index) => {
    if ('text' === section.type) {
      return <Text key={index} color={section.color} text={section.text} />;
    } else if ('image' === section.type) {
      return <Image key={index} full={section.full} image={section.image} />;
    } else {
      return 'TBD';
    }
  });
  return <div>{sections}</div>;
};

PageContents.PropTypes = {
  item: PropTypes.object.isRequired
};

export default PageContents;
