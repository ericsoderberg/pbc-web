import Edit from '../../components/Edit';
import CalendarFormContents from './CalendarFormContents';

export default class CalendarEdit extends Edit {}

CalendarEdit.defaultProps = {
  ...Edit.defaultProps,
  category: 'calendars',
  FormContents: CalendarFormContents,
  title: 'Edit Calendar',
};
