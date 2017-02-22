"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
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
        date: { $lt: date.toString() }
        // series: { $ne: true }
      })
      .sort('-date').select(PAGE_MESSAGE_FIELDS).exec()
      .then(message => {
        if (message && message.seriesId) {
          // get series also
          return Message.findOne({ _id: message.seriesId })
          .select(PAGE_MESSAGE_FIELDS).exec()
          .then(series => ({ message, series }));
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

const publicize = (data) => {
  console.log('!!! publicize');
  // get site
  const Site = mongoose.model('Site');
  return Site.findOne({})
  .select('homePageId')
  .exec()
  .then(site => ({ site }))
  // get all pages
  .then(context => {
    const Page = mongoose.model('Page');
    return Page.find({})
    .select('name sections')
    .exec()
    .then(pages => ({ ...context, pages }));
  })
  // generate an object keyed by page id and containing page references
  .then(context => {
    const { pages } = context;
    const pageMap = {};
    pages.forEach(page => {
      let children = [];
      page.sections.filter(s => 'pages' === s.type)
      .forEach(section => {
        section.pages.forEach(page => {
          children.push(page.id.toString());
        });
      });
      pageMap[page._id.toString()] = children;
    });
    return { ...context, pageMap };
  })
  // record all page ids descended from the home page
  .then(context => {
    const { pageMap, site } = context;
    const pagesRelatedToHome = {};
    const pagesVisited = {};
    const descend = (id) => {
      if (id && ! pagesVisited[id]) {
        pagesRelatedToHome[id] = true;
        pagesVisited[id] = true;
        pageMap[id].forEach(childId => descend(childId));
      }
    };
    if (site.homePageId) {
      descend(site.homePageId.toString());
    }
    return { ...context, pagesRelatedToHome };
  })
  // update any pages whose public state isn't correct
  .then(context => {
    const { pages, pagesRelatedToHome } = context;
    let promises = [];
    pages.forEach(page => {
      const publicPage = pagesRelatedToHome[page._id.toString()];
      if (publicPage !== page.public) {
        page.public = publicPage;
        promises.push(page.save());
      }
    });
    return Promise.all(promises);
  })
  .then(() => data);
};

export default function (router) {

  router.get('/pages/:id/map', (req, res) => {
    authorize(req, res)
    .then(session => {
      const Page = mongoose.model('Page');
      return Page.find({})
      .select('name path sections')
      .populate({ path: 'sections.pages.id', select: 'name path' })
      .exec();
    })
    .then(docs => {
      // generate an object keyed by page id and containing page references
      const pages = {};
      docs.forEach(doc => {
        let children = [];
        doc.sections.filter(s => 'pages' === s.type)
        .forEach(s => s.pages.filter(p => p.id)
          .forEach(p => children.push(p.id._id)));
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
    .catch(error => {
      console.log('!!!', error);
      res.status(400).json(error);
    });
  });

  router.post('/pages/publicize', (req, res) => {
    authorize(req, res, true)
    .then(session => publicize())
    .then(() => res.status(200).json({}))
    .catch(error => {
      console.log('!!! error', error);
      res.status(400).json(error);
    });
  });

  register(router, {
    category: 'pages',
    modelName: 'Page',
    index: {
      authorize: authorizedForDomain
    },
    get: {
      populate: [
        { path: 'sections.pages.id', select: 'name path' },
        { path: 'sections.people.id', select: 'name image' },
        {
          path: 'sections.eventId',
          select: 'name path start end dates times address location ' +
            'image'
        },
        { path: 'sections.libraryId', select: 'name path' },
        { path: 'sections.formTemplateId', select: 'name' }
      ],
      transformOut: (page, req) => {
        if (page && req.query.populate) {
          return populatePage(page);
        }
        return page;
      }
    },
    put: {
      transformIn: unsetDomainIfNeeded,
      transformOut: (data) => {
        publicize().then(() => console.log('!!! publicized')); // don't wait
        return data;
      }
    }
  });
}
