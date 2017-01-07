"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import NewsletterContents from './NewsletterContents';

export default class NewsletterPreview extends Component {

  render () {
    const { item: newsletter } = this.props;
    return (
      <main className="page-preview">
        <PageHeader title="Preview" />
        <NewsletterContents item={newsletter} />
      </main>
    );
  }
};

NewsletterPreview.propTypes = {
  item: PropTypes.object.isRequired
};
