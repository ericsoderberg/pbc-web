"use strict";
import React, { Component } from 'react';
import { Link } from 'react-router';
import { getSite, getItem } from '../../actions';
import PageHeader from '../../components/PageHeader';
import PageContents from '../page/PageContents';

export default class Home extends Component {

  constructor () {
    super();
    this.state = { site: {}, page: {} };
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
    .then(response => this.setState({ page: response }));
  }

  render () {
    const { site, page } = this.state;
    return (
      <main>
        <PageHeader logo={true} />
        <PageContents item={page} />
        <div className="section__container section__container--footer">
          <div className="page-links">
            <Link to="/calendar?name=Main" className="link--button">Calendar</Link>
            <Link to="/messages?library=Main" className="link--button">Messages</Link>
            <Link to="/search" className="link--button">Search</Link>
            <Link to="/sign-in" className="link--button">Sign In</Link>
          </div>
          <footer className="footer">
            <a href={`maps://?daddr=${encodeURIComponent(site.address)}`}>{site.address}</a>
            <a href={`tel:${site.phone}`}>{site.phone}</a>
            <span>{site.copyright}</span>
          </footer>
        </div>
      </main>
    );
  }
};
