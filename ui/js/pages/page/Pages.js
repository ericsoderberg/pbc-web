"use strict";
import React, { Component } from 'react';
import List from '../../components/List';
import PageItem from './PageItem';

export default class Pages extends Component {
  render () {
    return (
      <List title='Pages' category='pages' path='/pages'
        Item={PageItem} select='name path' {...this.props} />
    );
  }
};
