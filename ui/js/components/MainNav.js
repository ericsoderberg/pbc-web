"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { deleteSession } from '../actions';
import Stored from './Stored';

const MAIN_ROUTES = [
  { label: 'Home', path: '/' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Pages', path: '/pages' },
  { label: 'Events', path: '/events' },
  { label: 'Newsletters', path: '/newsletters' },
  { label: 'Forms', path: '/forms' },
  { label: 'Messages', path: '/messages' },
  { label: 'Users', path: '/users' },
  { label: 'Resources', path: '/resources' },
  { label: 'Site', path: '/site' }
];

class MainNav extends Component {

  constructor () {
    super();
    this._signOut = this._signOut.bind(this);
  }

  _signOut () {
    deleteSession();
  }

  render () {
    const links = MAIN_ROUTES.map(route => {
      let classes = ["main-nav__link"];
      if (this.context.router.isActive(route.path, true)) {
        classes.push("main-nav__link--active");
      }
      return (
        <li key={route.path}>
          <Link to={route.path} className={classes.join(' ')}>{route.label}</Link>
        </li>
      );
    });

    let session;
    if (this.props.session) {
      session = [
        <div key="name" className="main-nav__session-name">{this.props.session.name}</div>,
        <a key="control" className="main-nav__link" onClick={this._signOut}>Sign Out</a>
      ];
    } else {
      session = <Link className="main-nav__link" to="/sign-in" >Sign In</Link>;
    }

    return (
      <nav className={`main-nav ${this.props.className}`}>
        <ul className="main-nav__items">
          {links}
        </ul>
        <div className="main-nav__session">
          {session}
        </div>
      </nav>
    );
  }
};

MainNav.contextTypes = {
  router: PropTypes.any
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(MainNav, select);
