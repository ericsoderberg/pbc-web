import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { deleteSession } from '../actions';
import Stored from './Stored';

const MAIN_ROUTES = [
  { label: 'Home', path: '/' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Search', path: '/search' },
];

const DOMAIN_ADMIN_ROUTES = [
  { label: 'Pages', path: '/pages' },
  { label: 'Events', path: '/events' },
  { label: 'Newsletters', path: '/newsletters' },
  { label: 'Forms', path: '/forms' },
  { label: 'Form Templates', path: '/form-templates' },
  { label: 'Payments', path: '/payments' },
  { label: 'Email Lists', path: '/email-lists' },
];

const ADMIN_ROUTES = [
  { label: 'People', path: '/users' },
  // { label: 'Families', path: '/families' },
  { label: 'Resources', path: '/resources' },
  { label: 'Domains', path: '/domains' },
  { label: 'Calendars', path: '/calendars' },
  { label: 'Libraries', path: '/libraries' },
  { label: 'Files', path: '/files' },
  { label: 'Site', path: '/site' },
];

class MainNav extends Component {

  constructor() {
    super();
    this._signOut = this._signOut.bind(this);
  }

  _signOut() {
    deleteSession()
    .then(() => { window.location = '/'; })
    .catch(error => console.error('!!! MainNav _signOut catch', error));
  }

  _renderLinks(routes) {
    const links = routes.map((route) => {
      const classes = ['main-nav__link'];
      if (this.context.router.isActive(route.path, true)) {
        classes.push('main-nav__link--active');
      }
      return (
        <li key={route.path}>
          <Link to={route.path} className={classes.join(' ')}>
            {route.label}
          </Link>
        </li>
      );
    });

    return (
      <ul className="main-nav__items">
        {links}
      </ul>
    );
  }

  render() {
    const { className, session, onClick } = this.props;
    const mainLinks = this._renderLinks(MAIN_ROUTES);

    let sessionControls;
    let domainAdminLinks;
    let adminLinks;
    if (session) {
      sessionControls = [
        <Link key="name" className="main-nav__link"
          to={`/users/${session.userId}/edit`}>{session.name}</Link>,
        <button key="out" className="main-nav__link button-plain"
          onClick={this._signOut}>
          Sign Out
        </button>,
      ];
      if (session.administrator || session.administratorDomainId) {
        domainAdminLinks = this._renderLinks(DOMAIN_ADMIN_ROUTES);
      }
      if (session.administrator) {
        adminLinks = this._renderLinks(ADMIN_ROUTES);
      }
    } else {
      sessionControls = (
        <Link className="main-nav__link" to="/sign-in">Sign In</Link>
      );
    }

    return (
      <nav className={`main-nav ${className}`}
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
}

MainNav.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string,
    name: PropTypes.string,
    userId: PropTypes.string,
  }).isRequired,
};

MainNav.defaultProps = {
  className: undefined,
};

MainNav.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  session: state.session,
});

export default Stored(MainNav, select);
