"use strict";
import React, { Component, PropTypes } from 'react';
import { getSite, postSite } from '../../actions';
import Form from '../../components/Form';
import SiteFormContents from './SiteFormContents';

export default class SiteEdit extends Component {

  constructor (props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this.state = { site: {} };
  }

  componentDidMount () {
    document.title = 'Site';
    getSite()
    // allow for no site existing yet
    .then(site => this.setState({ site: site || {} }))
    .catch(error => console.log('!!! SiteEdit catch', error));
  }

  _onUpdate (site) {
    postSite(site)
    .then(response => this.context.router.goBack())
    .catch(error => this.setState({ error: error }));
  }

  _onCancel () {
    this.context.router.goBack();
  }

  render () {
    const { site, error } = this.state;

    return (
      <Form title="Edit Site" submitLabel="Update" action="/api/site"
        FormContents={SiteFormContents} item={site}
        onSubmit={this._onUpdate} error={error} onCancel={this._onCancel} />
    );
  }
};

SiteEdit.contextTypes = {
  router: PropTypes.any
};
