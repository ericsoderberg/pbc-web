"use strict";
import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { getItems } from '../../actions';
import List from '../../components/List';
import MessageItem from './MessageItem';

export default class Messages extends Component {

  constructor () {
    super();
    this.state = { filterOptions: [] };
  }

  componentDidMount () {
    getItems('messages', { distinct: 'library' })
    .then(response => this.setState({ filterOptions:
      // convert to options format with label and value properties
      response.map(value => ({ label: value, value: value }))}))
    .catch(error => console.log('!!! Messages catch', error));
  }

  render () {
    const { location } = this.props;
    const { filterOptions } = this.state;

    const filter = { property: "library", options: filterOptions };

    const marker = {
      property: 'date',
      value: (new Date()).toISOString(),
      label: (
        <div className="marker">
          <span>Today</span><span>{moment().format('MMM Do YYYY')}</span>
        </div>
      )
    };

    return (
      <List location={location}
        category="messages" title="Messages" path="/messages"
        filter={filter} sort="-date"
        Item={MessageItem} marker={marker} />
    );
  }
};

Messages.propTypes = {
  location: PropTypes.object
};
