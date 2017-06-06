import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import Button from '../../components/Button';
import ImageField from '../../components/ImageField';
import SelectSearch from '../../components/SelectSearch';
import TrashIcon from '../../icons/Trash';

const SiteFormContents = (props) => {
  const { formState } = props;
  const site = formState.object;

  const timezoneOptions = moment.tz.names().map(name =>
    <option key={name}>{name}</option>);

  let socialLinks;
  if (site.socialUrls && site.socialUrls.length > 0) {
    socialLinks = site.socialUrls.map((url, index) => (
      <FormField key={url}
        label="Social url"
        closeControl={
          <button type="button"
            className="button-icon"
            onClick={formState.removeAt('socialUrls', index)}>
            <TrashIcon secondary={true} />
          </button>
        }>
        <input name={`social-${index}`}
          value={url}
          onChange={formState.changeAt('socialUrls', index)} />
      </FormField>
    ));
  }

  return (
    <fieldset className="form__fields">
      <FormField label="Name">
        <input name="name"
          value={site.name || ''}
          onChange={formState.change('name')} />
      </FormField>
      <FormField label="Slogan">
        <input name="slogan"
          value={site.slogan || ''}
          onChange={formState.change('slogan')} />
      </FormField>
      <ImageField label="Logo"
        name="logo"
        formState={formState}
        property="logo" />
      <ImageField label="Mobile icon"
        name="mobileIcon"
        help="120x120 .png"
        formState={formState}
        property="mobileIcon" />
      <ImageField label="Shortcut icon"
        name="shortcutIcon"
        help="16x16 .png"
        formState={formState}
        property="shortcutIcon" />
      <FormField label="Brand color">
        <input name="color"
          value={site.color || ''}
          onChange={formState.change('color')} />
      </FormField>
      <FormField label="Home page">
        <SelectSearch category="pages"
          options={{ select: 'name', sort: 'name' }}
          value={(site.homePageId || {}).name || ''}
          onChange={suggestion =>
            formState.change('homePageId')({
              _id: suggestion._id, name: suggestion.name })} />
      </FormField>
      <FormField name="email" label="Email">
        <input name="email"
          value={site.email || ''}
          onChange={formState.change('email')} />
      </FormField>
      <FormField label="Address">
        <input name="address"
          value={site.address || ''}
          onChange={formState.change('address')} />
      </FormField>
      <FormField label="Phone">
        <input name="phone"
          value={site.phone || ''}
          onChange={formState.change('phone')} />
      </FormField>
      <FormField label="Timezone">
        <select name="timezone"
          value={site.timezone || ''}
          onChange={formState.change('timezone')}>
          {timezoneOptions}
        </select>
      </FormField>
      <FormField label="Copyright">
        <input name="copyright"
          value={site.copyright || ''}
          onChange={formState.change('copyright')} />
      </FormField>
      {socialLinks}
      <FormFieldAdd>
        <Button label="Add social url"
          secondary={true}
          onClick={formState.addTo('socialUrls', '')} />
      </FormFieldAdd>
    </fieldset>
  );
};

SiteFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
};

export default SiteFormContents;
