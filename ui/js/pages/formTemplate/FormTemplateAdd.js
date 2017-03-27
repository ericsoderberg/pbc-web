
import Add from '../../components/Add';
import FormPreview from '../form/FormPreview';
import FormTemplateFormContents from './FormTemplateFormContents';

export default class FormTemplateAdd extends Add {}

FormTemplateAdd.defaultProps = {
  ...Add.defaultProps,
  category: 'form-templates',
  default: { sections: [
    { id: 1000,
      fields: [
        { id: 1000, type: 'instructions', help: '## Title' },
        { id: 1001, type: 'line', name: 'Name', required: true, linkToUserProperty: 'name' },
        { id: 1002, type: 'line', name: 'Email', required: true, linkToUserProperty: 'email' },
      ],
    },
  ] },
  FormContents: FormTemplateFormContents,
  Preview: FormPreview,
  title: 'Add Form Template',
};
