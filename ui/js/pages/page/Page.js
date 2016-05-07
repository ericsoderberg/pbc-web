"use strict";
import React from 'react';
import Show from '../../components/Show';
import TextSection from './TextSection';
import ImageSection from './ImageSection';

const SECTIONS = {
  image: ImageSection,
  text: TextSection
};

export default class Page extends Show {
  _renderContents (item) {
    const sections = (item.sections || []).map((section, index) => {
      const Section = SECTIONS[section.type];
      return <Section key={index} section={section} />;
    });
    return <div>{sections}</div>;
  }
};

Page.defaultProps = {
  category: 'pages'
};
