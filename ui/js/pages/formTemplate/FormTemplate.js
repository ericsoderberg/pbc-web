"use strict";
import React from 'react';
import Show from '../../components/Show';

const FormTemplateContents = (props) => {
  return (
    <div>TBD</div>
  );
};

export default class FormTemplate extends Show {};

FormTemplate.defaultProps = {
  category: 'form-templates',
  Contents: FormTemplateContents
};
