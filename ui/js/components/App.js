"use strict";
import React, { Component, PropTypes } from 'react';
import MainNav from './MainNav';
import Stored from './Stored';

class App extends Component {

  render () {
    const { session } = this.props;

    let nav;
    if (session && session.administrator) {
      nav = <MainNav className="app__nav" />;
    }
    
    return (
      <div className="app">
        {nav}
        <section className="app__content">
          {this.props.children}
        </section>
      </div>
    );
  }
};

App.propTypes = {
  session: PropTypes.shape({
    administrator: PropTypes.bool
  })
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(App, select);
