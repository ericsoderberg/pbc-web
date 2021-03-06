import Edit from '../../components/Edit';
import DomainFormContents from './DomainFormContents';

export default class DomainEdit extends Edit {}

DomainEdit.defaultProps = {
  ...Edit.defaultProps,
  category: 'domains',
  FormContents: DomainFormContents,
  postRemovePath: '/domains',
  title: 'Edit Domain',
};
