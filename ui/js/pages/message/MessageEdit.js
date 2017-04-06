
import Edit from '../../components/Edit';
import MessageFormContents from './MessageFormContents';
import MessagePreview from './MessagePreview';

export default class MessageEdit extends Edit {}

MessageEdit.defaultProps = {
  ...Edit.defaultProps,
  category: 'messages',
  FormContents: MessageFormContents,
  postRemovePath: '/messages',
  Preview: MessagePreview,
  title: 'Edit Message',
};
