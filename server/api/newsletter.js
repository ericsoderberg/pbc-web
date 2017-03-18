import moment from 'moment';
import { markdown } from 'markdown';

function markupText(text, section) {
  let contents = markdown.toHTML(text);
  if (section.color) {
    contents = `
<div style="padding: 1px 24px; margin: 24px 0px; background-color: ${section.color}">
${contents}
</div>
    `;
  }
  return contents;
}

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

function markupEvent(event, urlBase) {
  const { nextDates: { dates, times } } = event;
  const url = `${urlBase}/events/${event.path || event._id}`;
  let image = '';
  if (event.image) {
    image = `
<a href="${url}"><img style="max-width: 432px; padding-top: 24px;"
src="${event.image.data}" /></a>
  `;
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
  <a style="display: block; padding-top: 24px; padding-bottom: 24px;
  font-size: 18px; font-weight: 600;" href="${url}">${event.name}</a>
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

function markupPage(page, section, urlBase) {
  const url = `${urlBase}/${page.path || `pages/${page._id}`}`;
  let image = '';
  if (section.backgroundImage) {
    image = `
<a href="${url}"><img style="max-width: 432px; padding-top: 24px;"
src="${section.backgroundImage.data}" /></a>
  `;
  }
  return `
<div style="padding-bottom: 24px; border-top: solid 1px #cccccc;">
  ${image}
  <a style="display: block; padding-top: 24px; padding-bottom: 24px;
  font-size: 18px; font-weight: 600;" href="${url}">${page.name}</a>
</a>
  `;
}

function markupFile(file, section, urlBase) {
  const url = `${urlBase}/file/${file._id}/${file.name}`;
  return `
<div style="margin-bottom: 24px; border-top: solid 1px #cccccc;">
  <a style="display: block; padding-top: 24px; padding-bottom: 24px;
  font-size: 18px; font-weight: 600;" href="${url}">${file.name}</a>
</a>
  `;
}

export function render(newsletter, urlBase) {
  const sections = (newsletter.sections || []).map((section) => {
    switch (section.type) {
      case 'text':
        return markupText(section.text, section);

      case 'image':
        return `<img style="max-width: 432px;" src="${section.image.data}" />`;

      case 'event': {
        const event = section.eventId;
        return markupEvent({ ...event.toObject(), nextDates: nextDates(event) }, urlBase);
      }

      case 'library': {
        const nextMessageMarkup = section.nextMessage ?
          markupMessage('This week', section.nextMessage, urlBase) : '';
        const previousMessageMarkup = section.previousMessage ?
          markupMessage('Last week', section.previousMessage, urlBase) : '';
        return `
<div style="padding-bottom: 24px; border-top: solid 1px #cccccc;">
${nextMessageMarkup}
${previousMessageMarkup}
</div>
        `;
      }

      case 'pages': return section.pages.map(page =>
        markupPage(page.page, section, urlBase));

      case 'files': return section.files.map(file =>
        markupFile(file, section, urlBase));

      default:
        return '<span>TBD</span>';
    }
  }).join('');

  return `
<html>
<head></head>
<body>
<div style="background-color: #f2f2f2; padding: 24px;">
<div style="padding: 24px; max-width: 480px; margin: 0 auto;
box-sizing: border-box;
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
${sections}
</div>
</div>
</body>
</html>
  `;
}
