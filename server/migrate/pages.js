"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import '../db';
import { loadCategoryArray } from './utils';
import results from './results';

// Page

function normalizePage (item) {
  item.oldId = item.id;
  item.created = item.created_at || undefined;
  item.modified = item.updated_at || undefined;
  item.sections = [];
  if (item.text) {
    item.sections.push({
      text: item.text,
      type: 'text'
    });
  }
  return item;
}

export default function () {
  const Page = mongoose.model('Page');
  let pages = {}; // oldId => doc
  let childOldIds = {}; // oldId => [oldId, ...]
  let contacts = {}; // oldId => item
  const pagesData = loadCategoryArray('pages');

  return Promise.resolve()
  .then(() => {
    loadCategoryArray('contacts').forEach(item => {
      if (! contacts[item.page_id]) {
        contacts[item.page_id] = [];
      }
      contacts[item.page_id].push(item);
    });
  })
  .then(() => {
    let pagePromises = [];
    pagesData.forEach(item => {

      if (item.parent_id) {
        if (! childOldIds[item.parent_id]) {
          childOldIds[item.parent_id] = [];
        }
        if (childOldIds[item.parent_id].indexOf(item.id) === -1) {
          childOldIds[item.parent_id].push(item.id);
        }
      }

      const promise = Page.findOne({ oldId: item.id }).exec()
      .then(page => {
        if (page) {
          return results.skipped('Page', page);
        } else {
          item = normalizePage(item);
          page = new Page(item);
          return page.save()
          .then(page => results.saved('Page', page))
          .catch(error => results.errored('Page', page, error));
        }
      })
      .then(page => pages[item.id] = page);
      pagePromises.push(promise);
    });
    return Promise.all(pagePromises);
  })
  // Once we've got all of the pages set up,
  // link pages together by parent id
  .then(() => {
    console.log('!!! link pages');
    let linkPromises = [];
    pagesData.forEach(item => {
      if (childOldIds[item.id]) {
        let page = pages[item.id];
        page.sections.push({
          pages: childOldIds[item.id].map(oldId => ({ id: pages[oldId]._id })),
          type: 'pages'
        });
        linkPromises.push(page.save());
      }
    });
    return Promise.all(linkPromises);
  })
  .then(() => console.log('!!! pages done'))
  .catch(error => console.log('!!! pages catch', error, error.stack));
}
