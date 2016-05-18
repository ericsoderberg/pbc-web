"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import ImageField from '../../components/ImageField';

export default class SiteFormContents extends Component {

  constructor () {
    super();
    this.state = { pages: [] };
  }

  componentDidMount () {
    this.refs.name.focus();
    getItems('pages')
    .then(response => this.setState({ pages: response }));
  }

  render () {
    const { formState } = this.props;
    const site = formState.object;

    const pages = this.state.pages.map(page => (
      <option key={page._id} label={page.name} value={page._id} />
    ));
    pages.unshift(<option key={0} />);

    return (
      <fieldset className="form__fields">
        <FormField label="Name">
          <input ref="name" name="name" value={site.name || ''}
            onChange={formState.change('name')}/>
        </FormField>
        <ImageField label="Logo" name="logo"
          formState={formState} property="logo" />
        <FormField label="Home page">
          <select name="homePageId" value={site.homePageId || ''}
            onChange={formState.change('homePageId')}>
            {pages}
          </select>
        </FormField>
        <FormField name="email" label="Email">
          <input name="email" value={site.email || ''}
            onChange={formState.change('email')}/>
        </FormField>
        <FormField label="Address">
          <input name="address" value={site.address || ''}
            onChange={formState.change('address')}/>
        </FormField>
        <FormField label="Phone">
          <input name="phone" value={site.phone || ''}
            onChange={formState.change('phone')}/>
        </FormField>
        <FormField label="Copyright">
          <input name="copyright" value={site.copyright || ''}
            onChange={formState.change('copyright')}/>
        </FormField>
      </fieldset>
    );
  }
};

SiteFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
