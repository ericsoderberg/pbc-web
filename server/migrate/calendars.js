"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import '../db';
import { loadCategoryArray } from './utils';
import results from './results';

const CALENDARS = [
  { name: 'Children', path: 'children', pageId: 15 },
  { name: 'Junior High', path: 'junior-high', pageId: 4 },
  { name: 'High School', path: 'high-school', pageId: 3 },
  { name: 'College', path: 'college', pageId: 6 },
  { name: 'Young Adults', path: 'young-adults', pageId: 90 },
  { name: 'Women', path: 'women', pageId: 2 },
  { name: 'Recovery', path: 'recovery', pageId: 77 },
  { name: 'Private', path: 'private', pageId: 160, private: true }
];

// Calendar

export default function () {
  const Calendar = mongoose.model('Calendar');
  const Event = mongoose.model('Event');

  const pagesData = loadCategoryArray('pages');
  const eventsData = loadCategoryArray('events');

  let calendarPromise = Promise.resolve();
  CALENDARS.forEach(spec => {

    // process calendars sequentially
    calendarPromise = calendarPromise
    .then(() => {

      console.log('!!! start', spec.name);
      // create Library
      return Calendar.findOne({ name: spec.name }).exec()
      .then(calendar => {
        if (calendar) {
          return results.skipped('Calendar', calendar);
        } else {
          const calendar = new Calendar({
            name: spec.name, path: spec.path, private: spec.private
          });
          return calendar.save()
          .then(calendar => results.saved('Calendar', calendar))
          .catch(error => results.errored('Calendar', calendar, error));
        }
      })
      .then(calendar => {
        // find all pages under parent page
        let checkPageIds = [spec.pageId];
        let pageIds = [];
        while (checkPageIds.length > 0) {
          const pageId = checkPageIds.shift();
          pageIds.push(pageId);
          checkPageIds = checkPageIds.concat(pagesData
            .filter(item => item.parent_id === pageId)
            .map(item => item.id));
        }
        console.log('!!! calendar', spec.name, pageIds.length, 'pages');
        // assign all events on these pages to this calendar
        const eventPromises = [];
        eventsData.filter(item => pageIds.indexOf(item.page_id) !== -1)
        .forEach(item => {
          const promise = Event.findOne({ oldId: item.id }).exec()
          .then(event => {
            // We can have no Event if this was a slave event.
            // We only migrate the master event as a distinct Event
            if (event) {
              event.calendarId = calendar._id;
              return event.save();
            }
          });
          eventPromises.push(promise);
        });
        return Promise.all(eventPromises).then(() => calendar);
      });

    });
  });

  return calendarPromise
  .then(() => console.log('!!! calendars done'))
  .catch(error => console.log('!!! calendars catch', error, error.stack));
}
