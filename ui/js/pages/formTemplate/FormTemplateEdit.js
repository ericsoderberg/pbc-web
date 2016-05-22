"use strict";
import Edit from '../../components/Edit';
import FormPreview from '../form/FormPreview';
import FormTemplateFormContents from './FormTemplateFormContents';

export default class FormTemplateEdit extends Edit {};

FormTemplateEdit.defaultProps = {
  category: 'form-templates',
  FormContents: FormTemplateFormContents,
  Preview: FormPreview,
  title: 'Edit Form Template'
};
