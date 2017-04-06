
import Edit from '../../components/Edit';
import FormPreview from '../form/FormPreview';
import FormTemplateFormContents from './FormTemplateFormContents';

export default class FormTemplateEdit extends Edit {}

FormTemplateEdit.defaultProps = {
  ...Edit.defaultProps,
  category: 'form-templates',
  FormContents: FormTemplateFormContents,
  postRemovePath: '/form-templates',
  Preview: FormPreview,
  title: 'Edit Form Template',
};
