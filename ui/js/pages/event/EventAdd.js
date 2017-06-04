import moment from 'moment-timezone';
import Add from '../../components/Add';
import EventFormContents from './EventFormContents';
import EventPreview from './EventPreview';

export default class EventAdd extends Add {}

EventAdd.defaultProps = {
  ...Add.defaultProps,
  category: 'events',
  default: {
    start: moment().startOf('hour').add(1, 'hour'),
    end: moment().startOf('hour').add(2, 'hour'),
  },
  FormContents: EventFormContents,
  Preview: EventPreview,
  showable: true,
  title: 'Add Event',
};
