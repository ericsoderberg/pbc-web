import Add from '../../components/Add';
import CalendarFormContents from './CalendarFormContents';

export default class CalendarAdd extends Add {}

CalendarAdd.defaultProps = {
  ...Add.defaultProps,
  category: 'calendars',
  FormContents: CalendarFormContents,
  title: 'Add Calendar',
};
