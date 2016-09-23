"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import MessageContents from './MessageContents';

export default class MessagePreview extends Component {

  render () {
    const { item: message } = this.props;

    return (
      <main className="page-preview">
        <PageHeader title="Preview" />
        <MessageContents item={message} />
      </main>
    );
  }
};

MessagePreview.propTypes = {
  item: PropTypes.object.isRequired
};
