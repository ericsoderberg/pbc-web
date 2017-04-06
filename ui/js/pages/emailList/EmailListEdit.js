import Edit from '../../components/Edit';
import EmailListFormContents from './EmailListFormContents';

export default class EmailListEdit extends Edit {}

EmailListEdit.defaultProps = {
  ...Edit.defaultProps,
  category: 'email-lists',
  FormContents: EmailListFormContents,
  postRemovePath: '/email-lists',
  title: 'Edit Email List',
};
