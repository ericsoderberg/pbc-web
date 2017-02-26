"use strict";
import React, { Component } from 'react';
import Add from '../../components/Add';
import FamilyFormContents from './FamilyFormContents';
import Stored from '../../components/Stored';

class FamilyAdd extends Component {
  render () {
    const { session } = this.props;
    const family = {
      adults: [{ email: session.email, name: session.name }],
      children: []
    };
    return (
      <Add category="families" default={family} createSession={true}
        FormContents={FamilyFormContents} title="Add Family" />
    );
  }
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(FamilyAdd, select);
