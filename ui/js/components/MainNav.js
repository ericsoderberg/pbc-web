"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

const MAIN_ROUTES = [
  { label: 'Home', path: '/' },
  { label: 'Pages', path: '/pages' },
  { label: 'Events', path: '/events' },
  { label: 'Newsletters', path: '/newsletters' },
  { label: 'Forms', path: '/forms' },
  { label: 'Messages', path: '/messages' },
  { label: 'Users', path: '/users' },
  { label: 'Resources', path: '/resources' },
  { label: 'Site', path: '/site' },
  { label: 'Sign In', path: '/sign-in' }
];

export default class MainNav extends Component {

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
    return (
      <nav className={`main-nav ${this.props.className}`}>
        <ul className="main-nav__items">
          {links}
        </ul>
      </nav>
    );
  }
};

MainNav.contextTypes = {
  router: PropTypes.any
};
