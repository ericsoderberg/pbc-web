import { postSubscribe, postUnsubscribe } from '../../actions';
import Edit from '../../components/Edit';
import UserFormContents from './UserFormContents';

export default class UserEdit extends Edit {}

function updateEmailLists(user) {
  const promises = [Promise.resolve(user)];
  (user.emailLists || []).forEach((emailList) => {
    if (emailList.unsubscribe) {
      promises.push(postUnsubscribe(emailList, [user.email]));
    } else if (emailList.subscribe) {
      promises.push(postSubscribe(emailList, [user.email]));
    }
  });
  return Promise.all(promises);
}

UserEdit.defaultProps = {
  ...Edit.defaultProps,
  category: 'users',
  FormContents: UserFormContents,
  onUpdate: updateEmailLists,
  title: 'Edit Account',
};
