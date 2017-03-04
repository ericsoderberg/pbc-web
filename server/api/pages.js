import mongoose from 'mongoose';
import moment from 'moment';
import { authorize, authorizedForDomain } from './auth';
import { unsetDomainIfNeeded } from './domains';
import register from './register';

mongoose.Promise = global.Promise;

// /api/pages

function addParents(page, pages) {
  page.parents = [];
  Object.keys(pages).forEach((id) => {
    const parent = pages[id];
    if (parent.children.some(childId => childId.equals(page._id))) {
      addParents(parent, pages);
      // don't care about children of parents
      parent.children = [];
      page.parents.push(parent);
    }
  });
}

function addChildren(page, pages) {
  page.children = page.children.map((childId) => {
    const child = pages[childId];
    addChildren(child, pages);
    return child;
  });
}

const PAGE_MESSAGE_FIELDS =
  'path name verses author date image series seriesId';

const populatePage = (page) => {
  const Message = mongoose.model('Message');
  const date = moment().subtract(1, 'day');

  const promises = [Promise.resolve(page)];

  // Library
  page.sections.filter(section => section.type === 'library')
  .forEach((section) => {
    promises.push(
      Message.findOne({
        libraryId: section.libraryId,
        date: { $lt: date.toString() },
        // series: { $ne: true }
      })
      .sort('-date').select(PAGE_MESSAGE_FIELDS).exec()
      .then((message) => {
        if (message && message.seriesId) {
          // get series also
          return Message.findOne({ _id: message.seriesId })
          .select(PAGE_MESSAGE_FIELDS).exec()
          .then(series => ({ message, series }));
        }
        return message;
      }),
    );
  });

  return Promise.all(promises)
  .then((docs) => {
    const pageData = docs[0].toObject();
    pageData.sections.filter(section => section.type === 'library')
    .forEach((section, index) => {
      section.message = docs[1 + index];
    });
    return pageData;
  });
};

const publicize = (data) => {
  // console.log('!!! publicize');
  // get site
  const Site = mongoose.model('Site');
  return Site.findOne({})
  .select('homePageId')
  .exec()
  .then(site => ({ site }))
  // get all pages
  .then((context) => {
    const Page = mongoose.model('Page');
    return Page.find({})
    .select('name sections')
    .exec()
    .then(pages => ({ ...context, pages }));
  })
  // generate an object keyed by page id and containing page references
  .then((context) => {
    const { pages } = context;
    const pageMap = {};
    pages.forEach((page) => {
      const children = [];
      page.sections.filter(s => s.type === 'pages')
      .forEach((section) => {
        section.pages.forEach((sectionPage) => {
          children.push(sectionPage.id.toString());
        });
      });
      pageMap[page._id.toString()] = children;
    });
    return { ...context, pageMap };
  })
  // record all page ids descended from the home page
  .then((context) => {
    const { pageMap, site } = context;
    const pagesRelatedToHome = {};
    const pagesVisited = {};
    const descend = (id) => {
      if (id && !pagesVisited[id]) {
        pagesRelatedToHome[id] = true;
        pagesVisited[id] = true;
        const children = pageMap[id];
        if (children) {
          children.forEach(childId => descend(childId));
        }
      }
    };
    if (site.homePageId) {
      descend(site.homePageId.toString());
    }
    return { ...context, pagesRelatedToHome };
  })
  // update any pages whose public state isn't correct
  .then((context) => {
    const { pages, pagesRelatedToHome } = context;
    const promises = [];
    pages.forEach((page) => {
      const publicPage = pagesRelatedToHome[page._id.toString()];
      if (publicPage !== page.public) {
        page.public = publicPage;
        promises.push(page.save());
      }
    });
    return Promise.all(promises);
  })
  .then(() => data)
  .catch((error) => {
    console.error('!!!', error);
    return data;
  });
};

export default function (router) {
  router.get('/pages/:id/map', (req, res) => {
    authorize(req, res)
    .then(() => {
      const Page = mongoose.model('Page');
      return Page.find({})
      .select('name path sections')
      .populate({ path: 'sections.pages.id', select: 'name path' })
      .exec();
    })
    .then((docs) => {
      // generate an object keyed by page id and containing page references
      const pages = {};
      docs.forEach((doc) => {
        const children = [];
        doc.sections.filter(s => s.type === 'pages')
        .forEach(s => s.pages.filter(p => p.id)
          .forEach(p => children.push(p.id._id)));
        const page = { _id: doc._id, children, name: doc.name };
        pages[doc._id] = page;
      });
      return pages;
    })
    .then((pages) => {
      const id = req.params.id;
      const map = pages[id];
      addParents(map, pages);
      addChildren(map, pages);
      return map;
    })
    .then(map => res.status(200).json(map))
    .catch((error) => {
      console.error('!!!', error);
      res.status(400).json(error);
    });
  });

  router.post('/pages/publicize', (req, res) => {
    authorize(req, res, true)
    .then(() => publicize())
    .then(() => res.status(200).json({}))
    .catch((error) => {
      console.error('!!! error', error);
      res.status(400).json(error);
    });
  });

  register(router, {
    category: 'pages',
    modelName: 'Page',
    index: {
      authorize: authorizedForDomain,
    },
    get: {
      populate: [
        { path: 'sections.pages.id', select: 'name path', model: 'Page' },
        { path: 'sections.people.id', select: 'name image', model: 'User' },
        {
          path: 'sections.eventId',
          select: 'name path start end dates times address location ' +
            'image',
          model: 'Event',
        },
        { path: 'sections.libraryId', select: 'name path', model: 'Library' },
        { path: 'sections.formTemplateId',
          select: 'name',
          model: 'FormTemplate' },
      ],
      transformOut: (page, req) => {
        if (page && req.query.populate) {
          return populatePage(page);
        }
        return page;
      },
    },
    put: {
      transformIn: unsetDomainIfNeeded,
      transformOut: (data) => {
        publicize(); // don't wait
        return data;
      },
    },
  });
}
