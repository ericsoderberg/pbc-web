"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Stored from './Stored';

const MAIN_ROUTES = [
  { label: 'Home', path: '/' },
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
      session = <div>{this.props.session.name}</div>;
    } else {
      session = <Link to="/sign-in" >Sign In</Link>;
    }

    return (
      <nav className={`main-nav ${this.props.className}`}>
        <ul className="main-nav__items">
          {links}
        </ul>
        {session}
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
