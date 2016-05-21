"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import EventContents from './EventContents';

export default class EventPreview extends Component {

  render () {
    const { item } = this.props;
    const event = item;

    return (
      <main className="page-preview">
        <PageHeader />
        <EventContents item={event} />
      </main>
    );
  }
};

EventPreview.propTypes = {
  item: PropTypes.object.isRequired
};
