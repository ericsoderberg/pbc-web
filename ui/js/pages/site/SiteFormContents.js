"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import Button from '../../components/Button';
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
        <ImageField label="Mobile icon" name="mobileIcon" help="120x120 .png"
          formState={formState} property="mobileIcon" />
        <ImageField label="Shortcut icon" name="shortcutIcon" help="16x16 .png"
          formState={formState} property="shortcutIcon" />
        <FormField label="Home page">
          <SelectSearch category="pages"
            options={{ select: 'name', sort: 'name' }}
            value={(site.homePageId || {}).name || ''}
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
        <FormFieldAdd>
          <Button label="Add social url" secondary={true}
            onClick={formState.addTo('socialUrls', '')} />
        </FormFieldAdd>
      </fieldset>
    );
  }
};

SiteFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
