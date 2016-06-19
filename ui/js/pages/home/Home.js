"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getSite, getItems, getItem, deleteSession } from '../../actions';
// import PageHeader from '../../components/PageHeader';
import PageContents from '../page/PageContents';
import FacebookIcon from '../../icons/Facebook';
import TwitterIcon from '../../icons/Twitter';
import VimeoIcon from '../../icons/Vimeo';
import YouTubeIcon from '../../icons/YouTube';
import Stored from '../../components/Stored';
import Loading from '../../components/Loading';

class Home extends Component {

  constructor () {
    super();
    this._signOut = this._signOut.bind(this);
    this.state = {};
  }

  componentDidMount () {
    getSite()
    .then(site => {
      this.setState({ site: site });
      if (site.homePageId) {
        document.title = site.name;
        return getItem('pages', site.homePageId);
      } else {
        return Promise.reject();
      }
    })
    .then(response => this.setState({ page: response }))
    .catch(error => console.log('!!! Home catch', error));

    getItems('events', { limit: 1, select: 'name' })
    .then(events => this.setState({ haveEvents: events.length > 0 }));

    getItems('messages', { limit: 1, select: 'name' })
    .then(messages => this.setState({ haveMessages: messages.length > 0 }));
  }

  _signOut () {
    deleteSession()
    .then(() => this.context.router.go('/'))
    .catch(error => console.log('!!! Home _signOut catch', error));
  }

  _renderLinks () {
    const { session } = this.props;
    const { haveEvents, haveMessages } = this.state;
    let links = [];
    if (haveEvents) {
      links.push(
        <Link key="calendar" to="/calendar">
          <span className="link__text">Calendar</span>
        </Link>
      );
    }
    if (haveMessages) {
      links.push(
        <Link key="libray" to="/messages">
          <span className="link__text">Messages</span>
        </Link>
      );
    }
    // if (page) {
    //   links.push(
    //     <Link key="search" to="/search">
    //       <span className="link__text">Search</span>
    //     </Link>
    //   );
    // }
    if (session && session.token) {
      links.push(
        <a key="session" onClick={this._signOut}>
          <span className="link__text">Sign Out</span>
        </a>
      );
    } else {
      links.push(
        <Link key="session" to="/sign-in">
          <span className="link__text">Sign In</span>
        </Link>
      );
    }
    return links;
  }

  _renderContents () {
    const { site, page } = this.state;

    let pageContents;
    if (page) {
      pageContents = <PageContents key="page" item={page} />;
    } else {
      pageContents = <Loading key="page" />;
    }

    const links = this._renderLinks();

    let socialLinks;
    if (site.socialUrls && site.socialUrls.length > 0) {
      const links = site.socialUrls.map(url => {
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
      socialLinks = (
        <div className="social-links">
          {links}
        </div>
      );
    }

    return [
      // <PageHeader key="header" logo={true} />,
      pageContents,
      <div key="footer"
        className="section__container section__container--footer">
        <div className="page-links">
          {links}
        </div>
        {socialLinks}
        <footer className="home__footer footer">
          <a href={`maps://?daddr=${encodeURIComponent(site.address)}`}>{site.address}</a>
          <a href={`tel:${site.phone}`}>{site.phone}</a>
          <span>{site.copyright}</span>
        </footer>
      </div>
    ];
  }

  render () {
    const { site } = this.state;

    let contents;
    if (site) {
      contents = this._renderContents();
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        {contents}
      </main>
    );
  }
};

Home.propTypes = {
  session: PropTypes.shape({
    token: PropTypes.any
  })
};

Home.contextTypes = {
  router: PropTypes.any
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(Home, select);
