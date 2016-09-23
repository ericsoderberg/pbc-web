"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import NewsletterContents from './NewsletterContents';

export default class NewsletterPreview extends Component {

  render () {
    const { item: newsletter } = this.props;

    let sendControl;
    if (newsletter.address) {
      sendControl = (
        <button type="button" className="button-header">Send</button>
      );
    }

    return (
      <main className="page-preview">
        <PageHeader title="Preview" actions={sendControl} />
        <NewsletterContents item={newsletter} />
      </main>
    );
  }
};

NewsletterPreview.propTypes = {
  item: PropTypes.object.isRequired
};
