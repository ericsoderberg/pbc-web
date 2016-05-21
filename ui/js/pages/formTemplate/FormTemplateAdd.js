"use strict";
import Add from '../../components/Add';
import FormTemplateFormContents from './FormTemplateFormContents';

export default class FormTemplateAdd extends Add {};

FormTemplateAdd.defaultProps = {
  category: 'form-templates',
  default: { sections: [{}] },
  FormContents: FormTemplateFormContents,
  title: 'Add Form Template'
};
