import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';

const ResourceFormContents = (props) => {
  const { className, formState } = props;
  const resource = formState.object;

  return (
    <div className={className}>
      <fieldset className="form__fields">
        <FormField label="Name">
          <input name="name"
            value={resource.name || ''}
            onChange={formState.change('name')} />
        </FormField>
      </fieldset>
    </div>
  );
};

ResourceFormContents.propTypes = {
  className: PropTypes.string.isRequired,
  formState: PropTypes.object.isRequired,
};

export default ResourceFormContents;
