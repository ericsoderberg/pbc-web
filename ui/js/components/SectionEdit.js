import React, { PropTypes } from 'react';
import SectionFields from './SectionFields';

const SectionEdit = (props) => {
  const { children, formState } = props;

  return (
    <fieldset className="form__fields section-edit">
      {children}
      <SectionFields formState={formState} />
    </fieldset>
  );
};

SectionEdit.propTypes = {
  children: PropTypes.any.isRequired,
  formState: PropTypes.object.isRequired,
};

export default SectionEdit;
