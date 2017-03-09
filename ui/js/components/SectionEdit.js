import React, { PropTypes } from 'react';
import SectionFields from './SectionFields';

const SectionEdit = (props) => {
  const { allowBackgroundImage, children, formState } = props;

  return (
    <fieldset className="form__fields section-edit">
      {children}
      <SectionFields formState={formState}
        allowBackgroundImage={allowBackgroundImage} />
    </fieldset>
  );
};

SectionEdit.propTypes = {
  allowBackgroundImage: PropTypes.bool,
  children: PropTypes.any.isRequired,
  formState: PropTypes.object.isRequired,
};

SectionEdit.defaultProps = {
  allowBackgroundImage: true,
};

export default SectionEdit;
