"use strict";
import moment from 'moment';
import { markdown } from 'markdown';

export function render (newsletter) {
  const { text, previousMessage, nextMessage, events } = newsletter;

  let markedText;
  if (text) {
    markedText = markdown.toHTML(text);
  }

  let previousSection;
  if (previousMessage) {
    const url = `/messages/${previousMessage._id}`;
    previousSection = `
    <div>
      <h3>Last week</h3>
      <a href="${url}">${previousMessage.name}</a>
      <div>${previousMessage.verses}</div>
      <div>${previousMessage.author}</div>
    </div>
    `;
  }

  let nextSection;
  if (nextMessage) {
    const url = `/messages/${nextMessage._id}`;
    nextSection = `
    <div>
      <h3>This week</h3>
      <a href="${url}">${nextMessage.name}</a>
      <div>${nextMessage.verses}</div>
      <div>${nextMessage.author}</div>
    </div>
    `;
  }

  const eventItems = events.map(event => {
    return `
    <div>
      <h3>${event.name}</h3>
      <div>${event.start}</div>
      <div>${event.location}</div>
      <div>${event.address}</div>
    <div>
    `;
  });

  return `
<html>
<head></head>
<body>
<div>Subject: ${newsletter.name} - ${moment(newsletter.date).format('MMM Do YYYY')}</div>
${markedText}
<h2>Messages</h2>
${previousSection}
${nextSection}
<h2>Events</h2>
${eventItems}
</body>
</html>
  `;
}
