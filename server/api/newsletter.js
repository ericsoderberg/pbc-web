import moment from 'moment';
import { markdown } from 'markdown';

function nextDates(event) {
  const start = moment(event.start);
  const yesterday = moment().subtract(1, 'day');

  const dates = [];
  if (event.dates && event.dates.length > 0) {
    // distinguish multiple days in the same week from the same day across weeks
    if (moment(event.dates[0]).day() === start.day()) {
      // find the next date
      let nextDate;
      event.dates.forEach((date) => {
        date = moment(date);
        if (!nextDate ||
          (nextDate.isBefore(yesterday) && date.isAfter(nextDate)) ||
          (date.isAfter(yesterday) && date.isBefore(nextDate))) {
          nextDate = date;
        }
      });
      if (nextDate) {
        dates.push(nextDate); // .format('MMMM Do');
      }
    } else {
      dates.push(start);
      const end = moment(event.dates[event.dates.length - 1]);
      dates.push(end);
      // result = `${start.format('MMMM Do')} - ${end.format('MMMM Do')}`;
    }
  } else {
    dates.push(start); // .format('MMMM Do YYYY');
  }

  const times = [];
  if (dates.length > 0) {
    times.push(start); // .format(' @ h:mm a');
    if (event.times && event.times.length > 0) {
      event.times.forEach((time) => {
        times.push(moment(time.start));
        // result += ` & ${moment(time.start).format('h:mm a')}`;
      });
    }
  }
  return { dates, times };
}

// function compareEvents (e1, e2) {
//   // order by next date and time
//   const d1 = e1.nextDates.dates[0];
//   const d2 = e2.nextDates.dates[0];
//   const t1 = e1.nextDates.times[0];
//   const t2 = e2.nextDates.times[0];
//   return (d1.isBefore(d2) ? -1 :
//     d2.isBefore(d1) ? 1 :
//       (t1.isBefore(t2) ? -1 : t2.isBefore(t1) ? 1 : 0)
//   );
// }

function markupEvent(event, urlBase) {
  const { nextDates: { dates, times } } = event;
  const url = `${urlBase}/events/${event.path || event._id}`;
  let image = '';
  if (event.image) {
    image = `<a href="${url}"><img style="max-width: 432px; padding-top: 24px;" src="${event.image.data}" /></a>`;
  }
  let at = dates.map(d => d.format('MMMM Do')).join(' - ');
  if (dates.length <= 1) {
    at += ` @ ${times.map(t => t.format('h:mm a')).join(' & ')}`;
  }
  at = `<div style="padding-bottom: 6px;">${at}</div>`;
  let location = '';
  if (event.location) {
    location = `<div style="color: #999999;">${event.location}</div>`;
  }
  const address = '';
  if (event.address) {
    location = `<div style="color: #999999;">${event.address}</div>`;
  }
  let text;
  if (event.text) {
    text = `<div>${markdown.toHTML(event.text)}</div>`;
  } else {
    text = '<div style="padding-bottom: 24px;"></div>';
  }
  return `
  <div style="padding-bottom: 24px; border-top: solid 1px #cccccc;">
    ${image}
    <a style="display: block; padding-top: 24px; padding-bottom: 24px; font-size: 18px; font-weight: 600;" href="${url}">${event.name}</a>
    <div>${at}</div>
    ${location}
    ${address}
    ${text}
  </a>
  `;
}

function markupMessage(label, message, urlBase) {
  const url = `${urlBase}/messages/${message.path || message._id}`;
  let verses = '';
  if (message.verses) {
    verses = `<div style="padding-top: 6px; color: #999999">${message.verses}</div>`;
  }
  let author = '';
  if (message.author) {
    author = `<div style="padding-top: 6px; color: #999999">${message.author}</div>`;
  }
  return `
  <div>
    <h2 style="font-weight: 100;">${label}</h2>
    <a style="font-size: 18px; font-weight: 600;" href="${url}">${message.name}</a>
    ${verses}
    ${author}
  </div>
  `;
}

export function render(newsletter, urlBase) {
  const { events, image, nextMessage, previousMessage, text } = newsletter;

  let imageMarkup = '';
  if (image) {
    imageMarkup = `<img style="max-width: 432px;" src="${image.data}" />`;
  }

  let textMarkup = '';
  if (text) {
    textMarkup = markdown.toHTML(text);
  }

  let libraryMarkup = '';
  if (previousMessage || nextMessage) {
    let previousMessageMarkup;
    if (previousMessage) {
      previousMessageMarkup =
        markupMessage('Last week', previousMessage, urlBase);
    }

    let nextMessageMarkup;
    if (nextMessage) {
      nextMessageMarkup = markupMessage('This week', nextMessage, urlBase);
    }

    libraryMarkup = `
<div style="padding-bottom: 24px; border-top: solid 1px #cccccc;">
${nextMessageMarkup}
${previousMessageMarkup}
</div>
    `;
  }

  const eventsMarkup = events.map(event => ({
    // decorate with nextDates
    ...event.toObject(), nextDates: nextDates(event),
  }))
  // .sort(compareEvents)
  .map(event => markupEvent(event, urlBase)).join('\n');

  return `
<html>
<head></head>
<body>
<div style="background-color: #f2f2f2; padding: 24px;">
<div style="padding: 24px; max-width: 480px; margin: 0 auto;
background-color: #ffffff; color: #333333;
font-family: 'Work Sans', Arial, sans-serif; font-size: 18px;">
<table style="max-width: 432px; width: 100%; margin-bottom: 24px;
font-size: 20px;">
<tbody><tr>
<td><strong>${newsletter.name}</strong></td>
<td style="text-align: right; color: #999999;">
${moment(newsletter.date).format('MMM Do YYYY')}
</td>
</tr></tbody>
</table>
${imageMarkup}
${textMarkup}
${libraryMarkup}
${eventsMarkup}
</div>
</div>
</body>
</html>
  `;
}
