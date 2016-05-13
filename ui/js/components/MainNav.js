"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { deleteSession } from '../actions';
import Stored from './Stored';

const MAIN_ROUTES = [
  { label: 'Home', path: '/' },
  { label: 'Calendar', path: '/calendar/Main' }
];

const ADMIN_ROUTES = [
  { label: 'Pages', path: '/pages' },
  { label: 'Events', path: '/events' },
  { label: 'Newsletters', path: '/newsletters' },
  { label: 'Form Templates', path: '/form-templates' },
  { label: 'Messages', path: '/messages' },
  { label: 'People', path: '/users' },
  { label: 'Resources', path: '/resources' },
  { label: 'Files', path: '/files' },
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

  _renderLinks(routes) {
    const links = routes.map(route => {
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
      <ul className="main-nav__items">
        {links}
      </ul>
    );
  }

  render () {
    const mainLinks = this._renderLinks(MAIN_ROUTES);

    let session, adminLinks;
    if (this.props.session) {
      session = [
        <div key="name" className="main-nav__session-name">{this.props.session.name}</div>,
        <a key="control" className="main-nav__link" onClick={this._signOut}>Sign Out</a>
      ];
      if (this.props.session.administrator) {
        adminLinks = this._renderLinks(ADMIN_ROUTES);
      }
    } else {
      session = <Link className="main-nav__link" to="/sign-in" >Sign In</Link>;
    }

    return (
      <nav className={`main-nav ${this.props.className}`}>
        {mainLinks}
        {adminLinks}
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
