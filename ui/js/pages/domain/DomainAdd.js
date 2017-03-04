import Add from '../../components/Add';
import DomainFormContents from './DomainFormContents';

export default class DomainAdd extends Add {}

DomainAdd.defaultProps = {
  ...Add.defaultProps,
  category: 'domains',
  FormContents: DomainFormContents,
  title: 'Add Domain',
};
