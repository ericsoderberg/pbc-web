"use strict";
import React, { Component, PropTypes } from 'react';
import { getSite, getItems, postSite } from '../../actions';
import Form from '../../components/Form';
import FormField from '../../components/FormField';
import FormEvents from '../../utils/FormEvents';

export default class SiteEdit extends Component {

  constructor (props) {
    super(props);
    this._setSite = this._setSite.bind(this);
    this._onUpdate = this._onUpdate.bind(this);
    let site = {};
    this.state = {
      formEvents: new FormEvents(site, this._setSite),
      pages: [],
      site: site
    };
  }

  componentDidMount () {
    this.refs.name.focus();
    getSite()
    .then(this._setSite);
    getItems('pages')
    .then(response => this.setState({ pages: response }));
  }

  _setSite (site) {
    this.state.formEvents.set(site);
    this.setState({ site: site});
  }

  _onUpdate () {
    postSite(this.state.site)
      .then(response => this.context.router.goBack())
      .catch(error => this.setState({ error: error }));
  }

  render () {
    const { site, formEvents, error } = this.state;

    const pages = this.state.pages.map(page => (
      <option key={page._id} label={page.name} value={page._id} />
    ));

    return (
      <Form title="Edit Site" submitLabel="Update" action="/api/site"
        onSubmit={this._onUpdate} error={error}>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input ref="name" name="name" value={site.name || ''}
              onChange={formEvents.change('name')}/>
          </FormField>
          <FormField name="logo" label="Logo"
            onDrop={this.state.formEvents.dropFile('logo')}>
            <div>
              <img className="logo"
                src={site.logo ? site.logo.data : ''} />
            </div>
            <input name="logo" type="file"
              onChange={formEvents.changeFile('logo')}/>
          </FormField>
          <FormField label="Home page">
            <select name="homePageId" value={site.homePageId || ''}
              onChange={formEvents.change('homePageId')}>
              {pages}
            </select>
          </FormField>
          <FormField name="email" label="Email">
            <input name="email" value={site.email || ''}
              onChange={formEvents.change('email')}/>
          </FormField>
          <FormField label="Address">
            <input name="address" value={site.address || ''}
              onChange={formEvents.change('address')}/>
          </FormField>
          <FormField label="Phone">
            <input name="phone" value={site.phone || ''}
              onChange={formEvents.change('phone')}/>
          </FormField>
          <FormField label="Copyright">
            <input name="copyright" value={site.copyright || ''}
              onChange={formEvents.change('copyright')}/>
          </FormField>
        </fieldset>
      </Form>
    );
  }
};

SiteEdit.contextTypes = {
  router: PropTypes.any
};
