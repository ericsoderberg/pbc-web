import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';
import ImageField from '../../components/ImageField';
import TextHelp from '../../components/TextHelp';
import UserDomains from './UserDomains';

const UserFormContents = (props) => {
  const { className, formState, session } = props;
  const user = formState.object;

  let adminFields;
  if (session.userId.administrator) {
    adminFields = (
      <fieldset className="form__fields">
        <FormField>
          <input id="administrator"
            name="administrator"
            type="checkbox"
            checked={user.administrator || false}
            onChange={formState.toggle('administrator')} />
          <label htmlFor="administrator">Administrator</label>
        </FormField>
        <UserDomains formState={formState} />
      </fieldset>
    );
  }

  return (
    <div className={className}>
      <fieldset className="form__fields">
        <FormField label="Name">
          <input name="name"
            value={user.name || ''}
            onChange={formState.change('name')} />
        </FormField>
        <FormField name="email" label="Email">
          <input name="email"
            value={user.email || ''}
            onChange={formState.change('email')} />
        </FormField>
        <FormField name="password" label="Password">
          <input name="password"
            type="password"
            value={user.password || ''}
            onChange={formState.change('password')} />
        </FormField>
      </fieldset>

      <fieldset className="form__fields">
        <ImageField label="Photo"
          name="image"
          formState={formState}
          property="image" />
        <FormField name="text" label="Text" help={<TextHelp />}>
          <textarea name="text"
            value={user.text || ''}
            rows={8}
            onChange={formState.change('text')} />
        </FormField>
        <FormField name="phone" label="Phone">
          <input name="phone"
            value={user.phone || ''}
            onChange={formState.change('phone')} />
        </FormField>
      </fieldset>

      {adminFields}

    </div>
  );
};

UserFormContents.propTypes = {
  className: PropTypes.string,
  formState: PropTypes.object.isRequired,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      domainIds: PropTypes.arrayOf(PropTypes.string),
      name: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

UserFormContents.defaultProps = {
  className: undefined,
};

export default UserFormContents;
