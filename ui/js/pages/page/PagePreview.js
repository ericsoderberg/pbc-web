"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import TextSection from './TextSection';
import ImageSection from './ImageSection';

const SECTIONS = {
  image: ImageSection,
  text: TextSection
};

export default class PagePreview extends Component {

  render () {
    const { item } = this.props;
    const page = item;

    const sections = (page.sections || []).map((section, index) => {
      const Section = SECTIONS[section.type];
      return <Section key={index} section={section} />;
    });

    return (
      <main className="page-preview">
        <PageHeader title={page.name || ''} />
        {sections}
      </main>
    );
  }
};

PagePreview.propTypes = {
  item: PropTypes.object.isRequired
};
