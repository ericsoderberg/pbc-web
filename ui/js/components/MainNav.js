"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { deleteSession } from '../actions';
import Stored from './Stored';

const MAIN_ROUTES = [
  { label: 'Home', path: '/' },
  { label: 'Calendar', path: '/calendar?name=Main' },
  { label: 'Messages', path: '/messages?library=Main' },
  { label: 'Search', path: '/search' }
];

const DOMAIN_ADMIN_ROUTES = [
  { label: 'Pages', path: '/pages' },
  { label: 'Events', path: '/events' },
  { label: 'Newsletters', path: '/newsletters' },
  { label: 'Forms', path: '/forms' },
  { label: 'Form Templates', path: '/form-templates' },
  { label: 'Email Lists', path: '/email-lists' }
];

const ADMIN_ROUTES = [
  { label: 'People', path: '/users' },
  { label: 'Resources', path: '/resources' },
  { label: 'Domains', path: '/domains' },
  { label: 'Files', path: '/files' },
  { label: 'Site', path: '/site' }
];

class MainNav extends Component {

  constructor () {
    super();
    this._signOut = this._signOut.bind(this);
  }

  _signOut () {
    deleteSession()
    .then(() => window.location = '/')
    .catch(error => console.log('!!! MainNav _signOut catch', error));
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
    const { session, onClick } = this.props;
    const mainLinks = this._renderLinks(MAIN_ROUTES);

    let sessionControls, domainAdminLinks, adminLinks;
    if (session) {
      sessionControls = [
        <Link key="name" className="main-nav__link"
          to={`/users/${session.userId}/edit`}>{session.name}</Link>,
        <a key="out" className="main-nav__link" onClick={this._signOut}>
          Sign Out
        </a>
      ];
      if (session.administrator || session.administratorDomainId) {
        domainAdminLinks = this._renderLinks(DOMAIN_ADMIN_ROUTES);
      }
      if (session.administrator) {
        adminLinks = this._renderLinks(ADMIN_ROUTES);
      }
    } else {
      sessionControls = <Link className="main-nav__link" to="/sign-in" >Sign In</Link>;
    }

    return (
      <nav className={`main-nav ${this.props.className}`}
        onClick={onClick}>
        {mainLinks}
        {domainAdminLinks}
        {adminLinks}
        <div className="main-nav__session">
          {sessionControls}
        </div>
      </nav>
    );
  }
};

MainNav.propTypes = {
  onClick: PropTypes.func,
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string,
    name: PropTypes.string,
    userId: PropTypes.string
  })
};

MainNav.contextTypes = {
  router: PropTypes.any
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(MainNav, select);
