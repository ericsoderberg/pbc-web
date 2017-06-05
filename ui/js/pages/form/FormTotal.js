
import React from 'react';
import PropTypes from 'prop-types';
import { calculateTotal } from './FormUtils';

const FormTotal = (props) => {
  const { form, formTemplate } = props;

  const total = calculateTotal(formTemplate, form);

  return (
    <div className="form-total">
      <span className="secondary">Total</span>
      <span className="primary">$ {total}</span>
    </div>
  );
};

FormTotal.propTypes = {
  form: PropTypes.object.isRequired,
  formTemplate: PropTypes.object.isRequired,
};

export default FormTotal;
