"use strict";
import React, { Component, PropTypes } from 'react';
import { getSite, getPage, deleteSession } from '../../actions';
import PageContents from '../page/PageContents';
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
    this.state = {};
  }

  componentDidMount () {
    if (! this.props.site) {
      getSite()
      .then(site => {
        if (site.homePageId) {
          document.title = site.name;
          return getPage(site.homePageId);
        } else {
          return Promise.reject();
        }
      })
      .catch(error => console.log('!!! Home catch', error));
    }
  }

  _signOut () {
    deleteSession()
    .then(() => this.context.router.go('/'))
    .catch(error => console.log('!!! Home _signOut catch', error));
  }

  _renderSession () {
    const { session } = this.props;
    let sessionControl;
    if (session && session.token) {
      sessionControl = (
        <a className="home__sign-out" onClick={this._signOut}>
          <span className="link__text">Sign Out</span>
        </a>
      );
    } else {
      sessionControl = (
        <Button path="/sign-in">
          Sign In
        </Button>
      );
    }
    return sessionControl;
  }

  _renderContents () {
    const { site, page } = this.props;

    let pageContents;
    if (page) {
      pageContents = <PageContents key="page" item={page} />;
    } else {
      pageContents = <Loading key="page" />;
    }

    const sessionControl = this._renderSession();

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

    return [
      // <PageHeader key="header" logo={true} />,
      pageContents,
      <div key="footer"
        className="section__container section__container--footer">
        <div className="footer__links">
          <div className="home__brand">
            {logo}
            {socialLinks}
          </div>
          {sessionControl}
        </div>
        <footer className="home__footer footer">
          <a href={`maps://?daddr=${encodeURIComponent(site.address)}`}>{site.address}</a>
          <a href={`tel:${site.phone}`}>{site.phone}</a>
          <span>{site.copyright}</span>
        </footer>
      </div>
    ];
  }

  render () {
    const { site } = this.props;

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
    page = state.pages[state.site.homePageId];
  }
  return {
    page: page,
    session: state.session,
    site: state.site
  };
};

export default Stored(Home, select);
