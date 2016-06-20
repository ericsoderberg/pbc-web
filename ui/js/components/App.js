"use strict";
import React, { Component, PropTypes } from 'react';
import MainNav from './MainNav';
import Stored from './Stored';
import RightIcon from '../icons/Right';

class App extends Component {

  constructor () {
    super();
    this._onToggle = this._onToggle.bind(this);
    this.state = { navActive: false };
  }

  _onToggle () {
    this.setState({ navActive: ! this.state.navActive });
    window.scrollTo(0, 0);
  }

  render () {
    const { session } = this.props;
    const { navActive } = this.state;
    let classNames = ['app'];

    let nav, navControl;
    if (session && session.administrator) {
      nav = <MainNav onClick={this._onToggle} />;
      if (navActive) {
        classNames.push('app--nav');
      } else {
        navControl = (
          <button type="button" className="button-icon app__nav-control"
            onClick={this._onToggle}>
            <RightIcon />
          </button>
        );
      }
    }

    return (
      <div className={classNames.join(' ')}>
        {navControl}
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
