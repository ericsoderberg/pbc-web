"use strict";
import moment from 'moment';

export function friendlyTimes (event) {
  let format;
  if (event.dates && event.dates.length > 0) {
    format = 'dddd[s] @ h:mm a';
  } else {
    format = 'MMMM Do YYYY @ h:mm a';
  }
  let additionalTimes = '';
  if (event.times && event.times.length > 0) {
    additionalTimes = ' & ' + event.times.map(time => {
      return moment(time.start).format('h:mm a');
    }).join(' & ');
  }

  return moment(event.start).format(format) + additionalTimes;
}
