import Add from '../../components/Add';
import UserFormContents from './UserFormContents';

export default class UserAdd extends Add {}

UserAdd.defaultProps = {
  ...Add.defaultProps,
  category: 'users',
  FormContents: UserFormContents,
  title: 'Add Account',
};
