"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import '../db';
import { loadCategoryArray } from './utils';
import results from './results';

const DOMAINS = [
  { name: 'Children', pageIds: [15], calendars: ['Children'] },
  { name: 'Youth', pageIds: [3, 4], library: 'High School',
    calendars: ['High School', 'Junior High'] },
  { name: 'College and YAF', pageIds: [6, 90], library: 'Young Adults',
    calendars: ['College', 'Young Adults'] },
  { name: 'Women', pageIds: [2], library: 'Women', calendars: ['Women'] },
  { name: 'Recovery', pageIds: [77], library: 'Step Closer',
    calendars: ['Recovery'] }
];

// Domain

export default function () {
  const Domain = mongoose.model('Domain');
  const Page = mongoose.model('Page');
  const Calendar = mongoose.model('Calendar');
  const Event = mongoose.model('Event');
  const FormTemplate = mongoose.model('FormTemplate');
  const Form = mongoose.model('Form');
  const Payment = mongoose.model('Payment');
  const Library = mongoose.model('Library');
  const Message = mongoose.model('Message');

  const pagesData = loadCategoryArray('pages');
  const formsData = loadCategoryArray('forms');

  let domainPromise = Promise.resolve();
  DOMAINS.forEach(spec => {

    // process domains sequentially
    domainPromise = domainPromise
    .then(() => {

      console.log('!!! start', spec.name);
      // create Domain
      return Domain.findOne({ name: spec.name }).exec()
      .then(domain => {
        if (domain) {
          return results.skipped('Domain', domain);
        } else {
          const domain = new Domain({ name: spec.name });
          return domain.save()
          .then(calendar => results.saved('Domain', domain))
          .catch(error => results.errored('Domain', domain, error));
        }
      })
      .then(domain => {
        // find all pages under parent page
        let checkPageIds = spec.pageIds.slice(0);
        let pageIds = [];
        while (checkPageIds.length > 0) {
          const pageId = checkPageIds.shift();
          pageIds.push(pageId);
          checkPageIds = checkPageIds.concat(pagesData
            .filter(item => item.parent_id === pageId)
            .map(item => item.id));
        }
        const domainPromises = [];

        // assign all of these pages to this domain
        pageIds.forEach(id => {
          const promise = Page.update({ oldId: id },
            { $set: { domainId: domain._id } }).exec();
          domainPromises.push(promise);
        });

        // assign all form templates on these pages to this domain
        formsData.filter(item => pageIds.indexOf(item.page_id) !== -1)
        .forEach(item => {
          const promise = FormTemplate.findOne({ oldId: item.id }).exec()
          .then(formTemplate => {
            formTemplate.domainId = domain._id;
            return formTemplate.save();
          })
          .then(formTemplate => {
            // assign all forms for this template to this domain
            return Form.update({ formTemplateId: formTemplate._id },
              { $set: { domainId: domain._id } }).exec()
            .then(() => {
              Form.find({ formTemplateId: formTemplate._id }).exec()
              // assign all payments for these forms to this domain
              .then(forms => {
                const subPromises = [];
                forms.filter(form => form.paymentId).forEach(form => {
                  const promise = Payment.findOne({ _id: form.paymentId })
                  .exec()
                  .then(payment => {
                    payment.domainId = domain._id;
                    return payment.save();
                  });
                  subPromises.push(promise);
                });
                return Promise.all(subPromises);
              });
            });
          });
          domainPromises.push(promise);
        });

        if (spec.library) {
          // assign library to this domain
          const promise = Library.findOne({ name: spec.library }).exec()
          .then(library => {
            library.domainId = domain._id;
            return library.save();
          })
          // assign all messages in this library to this domain
          .then(library => {
            // assign all forms for this template to this domain
            return Message.update({ libraryId: library._id },
              { $set: { domainId: domain._id } }, { multi: true }).exec();
          });
          domainPromises.push(promise);
        }

        if (spec.calendars) {
          // assign calendars to this domain
          spec.calendars.forEach(calendarName => {
            const promise = Calendar.findOne({ name: calendarName }).exec()
            .then(calendar => {
              calendar.domainId = domain._id;
              return calendar.save();
            })
            // assign all events in this calendar to this domain
            .then(calendar => {
              return Event.update({ calendarId: calendar._id },
                { $set: { domainId: domain._id } }, { multi: true }).exec();
            });
            domainPromises.push(promise);
          });
        }

        return Promise.all(domainPromises).then(() => domain);
      });

    });
  });

  return domainPromise
  .then(() => console.log('!!! domains done'))
  .catch(error => console.log('!!! domains catch', error, error.stack));
}
