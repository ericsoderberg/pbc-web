"use strict";
import React, { Component } from 'react';
import MainNav from './MainNav';

export default class App extends Component {

  render () {
    return (
      <div className="app">
        <MainNav className="app__nav" />
        <section className="app__content">
          {this.props.children}
        </section>
      </div>
    );
  }
};
