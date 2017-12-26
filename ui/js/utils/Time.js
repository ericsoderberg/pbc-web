import moment from 'moment-timezone';

export const formatDate = (date, dayOfWeek = true) => {
  const showYear = date.isBefore(moment().subtract(3, 'months')) ||
    date.isAfter(moment().add(6, 'months'));
  return date.format(`${dayOfWeek ? 'dddd ' : ''}MMMM Do${showYear ? ' YYYY' : ''}`);
}

export const formatTime = (date, ampm = true) =>
  date.format(`${date.minute() === 0 ? 'h' : 'h:mm'}${ampm ? ' a' : ''}`);

export const formatTimes = (date1, date2) => {
  const noon = moment(date1).startOf('day').add(12, 'hours');
  const sameAmpm = ((date1.isBefore(noon) && date2.isBefore(noon)) ||
    (date1.isAfter(noon) && date2.isAfter(noon)));
  return `${formatTime(date1, !sameAmpm)} - ${formatTime(date2)}`;
};

let timezone = 'America/Los_Angeles';
moment.tz.setDefault(timezone);

export const setTimezone = (zone) => {
  timezone = zone || timezone;
  moment.tz.setDefault(timezone);
};

if (!moment.homeZone) {
  moment.homeZone = (...args) => moment.tz(args, timezone);
}

if (!moment.fn.homeZone) {
  moment.fn.homeZone = function homeZone() {
    return this.tz(timezone);
  };
}
