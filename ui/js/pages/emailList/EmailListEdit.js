import Edit from '../../components/Edit';
import EmailListFormContents from './EmailListFormContents';

export default class EmailListEdit extends Edit {}

EmailListEdit.defaultProps = {
  ...Edit.defaultProps,
  category: 'email-lists',
  FormContents: EmailListFormContents,
  removeBackLevel: 2,
  title: 'Edit Email List',
};
