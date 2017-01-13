"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getSite, getItem, deleteSession } from '../../actions';
import PageContents from '../page/PageContents';
import Section from '../../components/Section';
import FacebookIcon from '../../icons/Facebook';
import TwitterIcon from '../../icons/Twitter';
import VimeoIcon from '../../icons/Vimeo';
import YouTubeIcon from '../../icons/YouTube';
import Button from '../../components/Button';
import Stored from '../../components/Stored';
import Loading from '../../components/Loading';

class Home extends Component {

  constructor () {
    super();
    this._signOut = this._signOut.bind(this);
    this._siteReady = this._siteReady.bind(this);
    this._showMenu = this._showMenu.bind(this);
    this._hideMenu = this._hideMenu.bind(this);
    this.state = {};
  }

  componentDidMount () {
    const { site } = this.props;
    if (! site) {
      getSite()
      .then(this._siteReady)
      .catch(error => console.log('!!! Home catch', error));
    } else {
      this._siteReady(site);
    }
  }

  _siteReady (site) {
    const { page } = this.props;
    document.title = site.name;
    if (! page && site.homePageId) {
      return getItem('pages', site.homePageId._id,
        { cache: true, populate: true });
    } else {
      return Promise.reject();
    }
  }

  _signOut () {
    deleteSession()
    .then(() => this.context.router.go('/'))
    .catch(error => console.log('!!! Home _signOut catch', error));
  }

  _showMenu (event) {
    this.setState({ showMenu: true });
  }

  _hideMenu (event) {
    this.setState({ showMenu: false });
  }

  _renderSession () {
    const { session } = this.props;
    let contents;
    if (session && session.token) {
      contents = [
        <Link key="name" to={`/users/${session.userId}/edit`}>
          {session.name}
        </Link>,
        <a key="control" className="home__sign-out" onClick={this._signOut}>
          <span className="link__text">Sign Out</span>
        </a>
      ];
    } else {
      contents = <Button path="/sign-in">Sign In</Button>;
    }
    return <div className="home__session">{contents}</div>;
  }

  _renderMenuLinks () {
    const { page } = this.props;
    let links = [
      <Link key='/search' to='/search'>Search</Link>
    ];
    if (page) {

      page.sections.filter(section => 'pages' === section.type)
      .forEach(section => {
        section.pages.forEach(page => {
          page = page.id; // how the backend returns it
          let path = page.path ? `/${page.path}` : `/pages/${page._id}`;
          links.push(<Link key={path} to={path}>{page.name}</Link>);
        });
      });

      const calendarSections =
        page.sections.filter(section => 'calendar' === section.type);
      calendarSections.forEach(section => {
        const calendar = section.calendarId;
        let path = `/calendars/${calendar.path || calendar._id}`;
        links.push(<Link key={path} to={path}>{calendar.name}</Link>);
      });
      if (calendarSections.length === 0) {
        links.push(<Link key='/calendar' to='/calendar'>Calendar</Link>);
      }

      page.sections.filter(section => 'library' === section.type)
      .forEach(section => {
        const library = section.libraryId;
        let path = `/libraries/${library.path || library._id}`;
        links.push(<Link key={path} to={path}>{library.name}</Link>);
      });

    }
    return links;
  }

  _renderFooter () {
    const { site } = this.props;

    let socialLinks;
    if (site.socialUrls && site.socialUrls.length > 0) {
      socialLinks = site.socialUrls.map(url => {
        let contents;
        if (url.match(/facebook/)) {
          contents = <FacebookIcon />;
        } else if (url.match(/twitter/)) {
          contents = <TwitterIcon />;
        } else if (url.match(/vimeo/)) {
          contents = <VimeoIcon />;
        } else if (url.match(/youtube/)) {
          contents = <YouTubeIcon />;
        } else {
          contents = site;
        }
        return <a key={url} href={url}>{contents}</a>;
      });
    }

    let logo;
    if (site && site.logo) {
      logo = <img className="home__logo" src={site.logo.data} />;
    }

    const sessionControl = this._renderSession();

    return (
      <Section key="footer">
        <div>
          <div className="footer__links">
            <div className="home__brand">
              {logo}
              <div className="home__social">
                {socialLinks}
              </div>
            </div>
            <div className="home__nav">
              <Link to="/search"><Button>Search</Button></Link>
            </div>
            {sessionControl}
          </div>
          <footer className="home__footer footer">
            <a href={`maps://?daddr=${encodeURIComponent(site.address)}`}>
              {site.address}
            </a>
            <a href={`tel:${site.phone}`}>{site.phone}</a>
            <span>{site.copyright}</span>
          </footer>
        </div>
      </Section>
    );
  }

  _renderContents () {
    const { page } = this.props;
    const { showMenu } = this.state;

    let pageContents;
    if (page) {
      pageContents = <PageContents key="page" item={page} />;
    } else {
      pageContents = <Loading key="page" />;
    }

    let menuLayerClasses = ["home__menu-layer"];
    if (showMenu) {
      menuLayerClasses.push("home__menu-layer--active");
    }
    const links = this._renderMenuLinks();
    const menuLayer = (
      <div key="menuLayer" className={menuLayerClasses.join(' ')}>
        {links}
      </div>
    );

    let footer = this._renderFooter();

    return [
      <header key="header" className="home__header">
        <Button className="home__header-menu" plain={true}
          onClick={showMenu ? undefined : this._showMenu}>
          menu
        </Button>
        {menuLayer}
      </header>,
      pageContents,
      footer
    ];
  }

  render () {
    const { site } = this.props;
    const { showMenu } = this.state;

    let contents;
    if (site) {
      contents = this._renderContents();
    } else {
      contents = <Loading />;
    }

    return (
      <main onClick={showMenu ? this._hideMenu : undefined}>
        {contents}
      </main>
    );
  }
};

Home.propTypes = {
  page: PropTypes.object,
  session: PropTypes.shape({
    token: PropTypes.any
  }),
  site: PropTypes.object
};

Home.contextTypes = {
  router: PropTypes.any
};

const select = (state, props) => {
  let page;
  if (state.site && state.pages) {
    page = state.pages[state.site.homePageId._id];
  }
  return {
    page: page,
    session: state.session,
    site: state.site
  };
};

export default Stored(Home, select);
