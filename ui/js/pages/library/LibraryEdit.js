
import Edit from '../../components/Edit';
import LibraryFormContents from './LibraryFormContents';

export default class LibraryEdit extends Edit {}

LibraryEdit.defaultProps = {
  ...Edit.defaultProps,
  category: 'libraries',
  FormContents: LibraryFormContents,
  postRemovePath: '/libraries',
  title: 'Edit Library',
};
