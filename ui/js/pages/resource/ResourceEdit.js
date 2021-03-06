import Edit from '../../components/Edit';
import ResourceFormContents from './ResourceFormContents';

export default class ResourceEdit extends Edit {}

ResourceEdit.defaultProps = {
  ...Edit.defaultProps,
  category: 'resources',
  FormContents: ResourceFormContents,
  postRemovePath: '/resources',
  title: 'Edit Resource',
};
