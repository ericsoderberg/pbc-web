"use strict";
import Edit from '../../components/Edit';
import FormTemplateFormContents from './FormTemplateFormContents';
import FormPreview from '../form/FormPreview';

export default class FormTemplateEdit extends Edit {};

FormTemplateEdit.defaultProps = {
  category: 'form-templates',
  FormContents: FormTemplateFormContents,
  Preview: FormPreview,
  title: 'Edit Form Template'
};
