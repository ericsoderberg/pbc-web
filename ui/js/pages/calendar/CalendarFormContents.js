
import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';
import DomainIdField from '../../components/DomainIdField';

const CalendarFormContents = (props) => {
  const { className, errors, formState, session } = props;
  const calendar = formState.object;

  return (
    <div className={className}>
      <fieldset className="form__fields">
        <FormField label="Name" error={errors.name}>
          <input name="name"
            value={calendar.name || ''}
            onChange={formState.change('name')} />
        </FormField>
        <FormField name="path"
          label="Url ID"
          help="unique url name"
          error={errors.path}>
          <input name="path"
            value={calendar.path || ''}
            onChange={formState.change('path')} />
        </FormField>
        <FormField>
          <input name="public"
            type="checkbox"
            checked={calendar.public || false}
            onChange={formState.toggle('public')} />
          <label htmlFor="public">public</label>
        </FormField>
        <DomainIdField formState={formState} session={session} />
      </fieldset>
    </div>
  );
};

CalendarFormContents.propTypes = {
  className: PropTypes.string,
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

CalendarFormContents.defaultProps = {
  className: undefined,
  errors: {},
};

export default CalendarFormContents;
