import Add from '../../components/Add';
import EmailListFormContents from './EmailListFormContents';

export default class EmailListAdd extends Add {}

EmailListAdd.defaultProps = {
  ...Add.defaultProps,
  category: 'email-lists',
  FormContents: EmailListFormContents,
  title: 'Add Email List',
};
