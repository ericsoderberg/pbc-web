"use strict";
import Edit from '../../components/Edit';
import FormTemplateFormContents from './FormTemplateFormContents';

export default class FormTemplateEdit extends Edit {};

FormTemplateEdit.defaultProps = {
  category: 'form-templates',
  FormContents: FormTemplateFormContents,
  title: 'Edit Form Template'
};
