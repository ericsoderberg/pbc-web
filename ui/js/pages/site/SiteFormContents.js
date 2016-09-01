"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import ImageField from '../../components/ImageField';
import SelectSearch from '../../components/SelectSearch';
import TrashIcon from '../../icons/Trash';

export default class SiteFormContents extends Component {

  componentDidMount () {
    this.refs.name.focus();
  }

  render () {
    const { formState } = this.props;
    const site = formState.object;

    let socialLinks;
    if (site.socialUrls && site.socialUrls.length > 0) {
      socialLinks = site.socialUrls.map((url, index) => {
        return (
          <FormField key={index} label="Social url"
            closeControl={
              <button type="button" className="button-icon"
                onClick={formState.removeAt('socialUrls', index)}>
                <TrashIcon secondary={true} />
              </button>
            }>
            <input name={`social-${index}`} value={url}
              onChange={formState.changeAt('socialUrls', index)} />
          </FormField>
        );
      });
    }

    return (
      <fieldset className="form__fields">
        <FormField label="Name">
          <input ref="name" name="name" value={site.name || ''}
            onChange={formState.change('name')}/>
        </FormField>
        <ImageField label="Logo" name="logo"
          formState={formState} property="logo" />
        <FormField label="Home page">
          <SelectSearch category="pages"
            options={{ select: 'name', sort: 'name' }}
            value={(site.homePageId || {}).name}
            onChange={(suggestion) =>
              formState.change('homePageId')({
                _id: suggestion._id, name: suggestion.name })} />
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
        {socialLinks}
        <FormField>
          <div className="form__tabs">
            <button type="button" className="button button--secondary"
              onClick={formState.addTo('socialUrls', '')}>
              Add social url
            </button>
          </div>
        </FormField>
      </fieldset>
    );
  }
};

SiteFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
