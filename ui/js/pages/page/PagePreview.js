"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import Sections from '../../components/Sections';

export default class PagePreview extends Component {

  render () {
    const { item } = this.props;
    const page = item;
    return (
      <main className="page-preview">
        <PageHeader title="Preview" />
        <Sections align={page.align} sections={page.sections} />
      </main>
    );
  }
};

PagePreview.propTypes = {
  item: PropTypes.object.isRequired
};
