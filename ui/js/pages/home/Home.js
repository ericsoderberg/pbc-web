"use strict";
import React, { Component } from 'react';
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
      return getItem('pages', site.homePageId);
    })
    .then(response => this.setState({ page: response }));
  }

  render () {
    const { site, page } = this.state;
    return (
      <main>
        <PageHeader title={site.name || '-'} />
        <PageContents page={page} />
        <div className="page-footer__container">
          <footer className="page-footer">
            <a href={`maps://?daddr=${encodeURIComponent(site.address)}`}>{site.address}</a>
            <a href={`tel:${site.phone}`}>{site.phone}</a>
            <span>{site.copyright}</span>
          </footer>
        </div>
      </main>
    );
  }
};
