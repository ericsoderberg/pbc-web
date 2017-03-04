
import Add from '../../components/Add';
import FileFormContents from './FileFormContents';

export default class FileAdd extends Add {}

FileAdd.defaultProps = {
  ...Add.defaultProps,
  category: 'files',
  FormContents: FileFormContents,
  title: 'Add File',
};
