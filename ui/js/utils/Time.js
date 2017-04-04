import moment from 'moment';

export const formatDate = (date, dayOfWeek = true) =>
  date.format(
    `${dayOfWeek ? 'dddd ' : ''}MMMM Do${date.isSame(moment().startOf('day'), 'year') ? '' : ' YYYY'}`);

export const formatTime = (date, ampm = true) =>
  date.format(`${date.minute() === 0 ? 'h' : 'h:mm'}${ampm ? ' a' : ''}`);

export const formatTimes = (date1, date2) => {
  const noon = moment(date1).startOf('day').add(12, 'hours');
  const sameAmpm = ((date1.isBefore(noon) && date2.isBefore(noon)) ||
    (date1.isAfter(noon) && date2.isAfter(noon)));
  return `${formatTime(date1, !sameAmpm)} - ${formatTime(date2)}`;
};
