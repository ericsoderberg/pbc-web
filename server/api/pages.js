"use strict";
import mongoose from 'mongoose';
import moment from 'moment';
import { authorize, authorizedForDomain } from './auth';
import { unsetDomainIfNeeded } from './domains';
import register from './register';

// /api/pages

function addParents (page, pages) {
  page.parents = [];
  Object.keys(pages).forEach(id => {
    const parent = pages[id];
    if (parent.children.some(childId => childId.equals(page._id))) {
      addParents(parent, pages);
      // don't care about children of parents
      parent.children = [];
      page.parents.push(parent);
    }
  });
}

function addChildren (page, pages) {
  page.children = page.children.map(childId => {
    let child = pages[childId];
    addChildren(child, pages);
    return child;
  });
}

const PAGE_MESSAGE_FIELDS =
  'path name verses author date image series seriesId';

const populatePage = (page) => {
  const Message = mongoose.model('Message');
  let date = moment().subtract(1, 'day');

  let promises = [Promise.resolve(page)];

  // Library
  page.sections.filter(section => 'library' === section.type)
  .forEach(section => {
    promises.push(
      Message.findOne({
        libraryId: section.libraryId,
        date: { $gt: date.toString() },
        series: { $ne: true }
      })
      .sort('date').select(PAGE_MESSAGE_FIELDS).exec()
      .then(message => {
        if (message && message.seriesId) {
          // get series instead
          return (
            Message.findOne({ _id: message.seriesId })
            .select(PAGE_MESSAGE_FIELDS).exec()
          );
        } else {
          return message;
        }
      })
    );
  });

  return Promise.all(promises)
  .then(docs => {
    let pageData = docs[0].toObject();
    pageData.sections.filter(section => 'library' === section.type)
    .forEach((section, index) => {
      section.message = docs[1 + index];
    });
    return pageData;
  });
};

export default function (router) {

  router.get('/pages/:id/map', (req, res) => {
    authorize(req, res)
    .then(session => {
      const Page = mongoose.model('Page');
      return Page.find({})
      .select('name sections')
      .populate({ path: 'sections.pages.id', select: 'name path' })
      .exec();
    })
    .then(docs => {
      // generate an object keyed by page id and containing page references
      const pages = {};
      docs.forEach(doc => {
        let children = [];
        doc.sections.filter(s => 'pages' === s.type)
        .forEach(s => s.pages.forEach(p => children.push(p.id._id)));
        let page = { _id: doc._id, children: children, name: doc.name };
        pages[doc._id] = page;
      });
      return pages;
    })
    .then(pages => {
      const id = req.params.id;
      let map = pages[id];
      addParents(map, pages);
      addChildren(map, pages);
      return map;
    })
    .then(map => res.status(200).json(map))
    .catch(error => res.status(400).json(error));
  });

  register(router, 'pages', 'Page', {
    authorize: {
      index: authorizedForDomain
    },
    populate: {
      get: [
        { path: 'sections.pages.id', select: 'name path' },
        {
          path: 'sections.eventId',
          select: 'name path start end dates times address location'
        },
        { path: 'sections.libraryId', select: 'name path' },
        { path: 'sections.formTemplateId', select: 'name' }
      ]
    },
    transformIn: {
      put: unsetDomainIfNeeded
    },
    transformOut: {
      get: (page, req) => {
        if (page && req.query.populate) {
          return populatePage(page);
        }
        return page;
      }
    }
  });
}
