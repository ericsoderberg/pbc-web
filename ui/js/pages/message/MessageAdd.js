"use strict";
import React, { Component } from 'react';
import Add from '../../components/Add';
import MessageFormContents from './MessageFormContents';
import MessagePreview from './MessagePreview';

export default class MessageAdd extends Component {
  render () {
    const { location: { query } } = this.props;
    return (
      <Add category='messages' FormContents={MessageFormContents}
        Preview={MessagePreview} showable={true} title='Add Message'
        default={{ libraryId: query.libraryId }} />
    );
  }
};
