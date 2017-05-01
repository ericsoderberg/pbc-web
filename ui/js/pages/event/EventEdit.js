
import Edit from '../../components/Edit';
import EventFormContents from './EventFormContents';
import EventPreview from './EventPreview';

export default class EventEdit extends Edit {}

EventEdit.defaultProps = {
  ...Edit.defaultProps,
  category: 'events',
  FormContents: EventFormContents,
  postRemovePath: '/events',
  Preview: EventPreview,
  title: 'Edit Event',
};
