
import Add from '../../components/Add';
import FormPreview from '../form/FormPreview';
import FormTemplateFormContents from './FormTemplateFormContents';

export default class FormTemplateAdd extends Add {}

FormTemplateAdd.defaultProps = {
  ...Add.defaultProps,
  category: 'form-templates',
  default: { sections: [
    { fields: [
      { id: 1, type: 'instructions', help: '# Title' },
      { id: 2, type: 'line', name: 'Name' },
      { id: 3, type: 'line', name: 'Email' },
    ] },
  ] },
  FormContents: FormTemplateFormContents,
  Preview: FormPreview,
  title: 'Add Form Template',
};
