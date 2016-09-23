"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import PageContents from './PageContents';

export default class PagePreview extends Component {

  render () {
    const { item } = this.props;
    const page = item;
    return (
      <main className="page-preview">
        <PageHeader title="Preview" />
        <PageContents item={page} />
      </main>
    );
  }
};

PagePreview.propTypes = {
  item: PropTypes.object.isRequired
};
