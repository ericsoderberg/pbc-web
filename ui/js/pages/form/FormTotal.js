"use strict";
import React, { PropTypes } from 'react';
import { calculateTotal } from './FormUtils';

const FormTotal = (props) => {
  const { form, formTemplate } = props;

  let total = calculateTotal(formTemplate, form);

  return (
    <div className="form-total">
      <span className="secondary">Total</span>
      <span className="primary">$ {total}</span>
    </div>
  );
};

FormTotal.propTypes = {
  form: PropTypes.object,
  formTemplate: PropTypes.object
};

export default FormTotal;
