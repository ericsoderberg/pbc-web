
import React, { PropTypes } from 'react';
import FormField from '../../components/FormField';

const FileFormContents = (props) => {
  const { className, formState } = props;
  const file = formState.object;

  return (
    <div className={className}>
      <fieldset className="form__fields">
        <FormField label="Name">
          <input name="name" value={file.name || ''}
            onChange={formState.change('name')} />
        </FormField>
      </fieldset>
    </div>
  );
};

FileFormContents.propTypes = {
  className: PropTypes.string,
  formState: PropTypes.object.isRequired,
};

FileFormContents.defaultProps = {
  className: undefined,
};

export default FileFormContents;
