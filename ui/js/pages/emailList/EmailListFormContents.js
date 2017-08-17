import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';
import TextHelp from '../../components/TextHelp';
import DomainIdField from '../../components/DomainIdField';

const EmailListFormContents = (props) => {
  const { className, errors, formState, session } = props;
  const emailList = formState.object;

  return (
    <div className={className}>
      <fieldset className="form__fields">
        <FormField label="Name" error={errors.name}>
          <input name="name"
            value={emailList.name || ''}
            onChange={formState.change('name')} />
        </FormField>
        <FormField name="text"
          label="Description"
          help={<TextHelp />}
          error={errors.text}>
          <textarea name="text"
            value={emailList.text || ''}
            rows={4}
            onChange={formState.change('text')} />
        </FormField>
        <FormField label="Url ID"
          help="unique url name"
          error={errors.path}>
          <input name="path"
            value={emailList.path || ''}
            onChange={formState.change('path')} />
        </FormField>
        <FormField>
          <input name="public"
            type="checkbox"
            checked={emailList.public || false}
            onChange={formState.toggle('public')} />
          <label htmlFor="public">Allow self subscription</label>
        </FormField>
        <DomainIdField formState={formState} session={session} />
      </fieldset>
    </div>
  );
};

EmailListFormContents.propTypes = {
  className: PropTypes.string,
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

EmailListFormContents.defaultProps = {
  className: undefined,
  errors: {},
};

export default EmailListFormContents;
