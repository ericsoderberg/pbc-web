import React, { Component, PropTypes } from 'react';
import { getSite, postSite } from '../../actions';
import Form from '../../components/Form';
import SiteFormContents from './SiteFormContents';

export default class SiteEdit extends Component {

  constructor(props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this.state = { site: {} };
  }

  componentDidMount() {
    document.title = 'Site';
    getSite()
    // allow for no site existing yet
    .then(site => this.setState({ site: site || {} }))
    .catch(error => console.error('!!! SiteEdit catch', error));
  }

  _onUpdate(site) {
    const { router } = this.context;
    postSite(site)
    .then(() => router.history.goBack())
    .catch(error => this.setState({ error }));
  }

  _onCancel() {
    const { router } = this.context;
    router.history.goBack();
  }

  render() {
    const { site, error } = this.state;

    return (
      <Form title="Edit Site" submitLabel="Update" action="/api/site"
        FormContents={SiteFormContents} item={site}
        onSubmit={this._onUpdate} error={error} onCancel={this._onCancel} />
    );
  }
}

SiteEdit.contextTypes = {
  router: PropTypes.any,
};
