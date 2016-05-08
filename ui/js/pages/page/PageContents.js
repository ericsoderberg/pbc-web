"use strict";
import React, { PropTypes } from 'react';
import TextSection from './TextSection';
import ImageSection from './ImageSection';

const SECTIONS = {
  image: ImageSection,
  text: TextSection
};

const PageContents = (props) => {
  const page = props.item;
  const sections = (page.sections || []).map((section, index) => {
    const Section = SECTIONS[section.type];
    return <Section key={index} section={section} />;
  });
  return <div>{sections}</div>;
};

PageContents.PropTypes = {
  item: PropTypes.object.isRequired
};

export default PageContents;
