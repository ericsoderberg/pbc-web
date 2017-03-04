
import React, { PropTypes } from 'react';
import FormField from '../../components/FormField';

const DomainFormContents = (props) => {
  const { className, formState } = props;
  const domain = formState.object;

  return (
    <div className={className}>
      <fieldset className="form__fields">
        <FormField label="Name">
          <input name="name" value={domain.name || ''}
            onChange={formState.change('name')} />
        </FormField>
      </fieldset>
    </div>
  );
};

DomainFormContents.propTypes = {
  className: PropTypes.string,
  formState: PropTypes.object.isRequired,
};

DomainFormContents.defaultProps = {
  className: undefined,
};

export default DomainFormContents;
