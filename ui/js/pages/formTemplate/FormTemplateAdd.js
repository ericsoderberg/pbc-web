"use strict";
import Add from '../../components/Add';
import FormPreview from '../form/FormPreview';
import FormTemplateFormContents from './FormTemplateFormContents';

export default class FormTemplateAdd extends Add {};

FormTemplateAdd.defaultProps = {
  category: 'form-templates',
  default: { sections: [{}] },
  FormContents: FormTemplateFormContents,
  Preview: FormPreview,
  title: 'Add Form Template'
};
