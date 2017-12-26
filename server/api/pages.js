import mongoose from 'mongoose';
import moment from 'moment-timezone';
import {
  getSession, allowAnyone, authorizedForDomain, requireAdministrator,
  requireSomeAdministrator,
} from './auth';
// import { addForms, addNewForm } from './formTemplates';
import { unsetDomainIfNeeded } from './domains';
import register from './register';
import { catcher, sendImage } from './utils';

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
  'path name verses author date image series seriesId modified';

function latestDate(date1, date2) {
  return moment(date1).isAfter(moment(date2)) ? date1 : date2;
}

export const populatePage = (data) => { // , session) => {
  const Message = mongoose.model('Message');
  const Event = mongoose.model('Event');
  // const FormTemplate = mongoose.model('FormTemplate');
  const date = moment().subtract(1, 'day');
  const page = data.toObject();

  // We changed the caching behavior on Sep 7 2017
  page.modified = latestDate(page.modified, moment('2017-09-07'));

  // Updated modified based on events modified
  page.sections
    .filter(section => (section.type === 'event' && section.eventId))
    .forEach((section) => {
      page.modified = latestDate(page.modified, section.eventId.modified);
    });

  const promises = [Promise.resolve(page)];

  // Library
  page.sections
    .filter(section => (section.type === 'library' && section.libraryId))
    .forEach((section) => {
      promises.push(Message.findOne({
        series: { $exists: false },
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
        }));
    });

  // Calendar
  page.sections
    .filter(section => (section.type === 'calendar' && section.calendarId))
    .forEach((section) => {
      // un-populate
      section.calendar = section.calendarId;
      section.calendarId = section.calendarId._id;

      const start = moment(date);
      const end = moment(start).add(2, 'month');
      const filter = {
        calendarId: section.calendarId,
        $or: [
          { end: { $gte: start.toDate() }, start: { $lt: end.toDate() } },
          { dates: { $elemMatch: { $gte: start.toDate(), $lt: end.toDate() } } },
        ],
      };
      if (section.omitRecurring) {
        filter.dates = { $exists: true, $size: 0 };
      }
      promises.push(Event.find(filter)
        .then((events) => {
          // sort by which comes next
          const nextDate = event => (
            [...event.dates, event.start]
              .map(d => moment(d))
              .filter(d => d.isSameOrAfter(start) && d.isSameOrBefore(end))[0] ||
              moment(event.start)
          );
          events.sort((e1, e2) => {
            const d1 = nextDate(e1);
            const d2 = nextDate(e2);
            return d1.isBefore(d2) ? -1 : d2.isBefore(d1) ? 1 : 0;
          });
          return events;
        }));
    });

  // Don't load formTemplate when rendering on the server, we don't have
  // a session.
  // if (session !== false) {
  //   // FormTemplate
  //   page.sections
  //     .filter(section => (section.type === 'form' && section.formTemplateId))
  //     .forEach((section) => {
  //       section.formTemplateId = section.formTemplateId._id; // un-populate
  //       promises.push(
  //         FormTemplate.findOne({ _id: section.formTemplateId })
  //           .exec()
  //           .then((formTemplate) => {
  //             if (formTemplate) {
  //               if (session) {
  //                 return addForms(formTemplate, session)
  //                   .then(data2 => addNewForm(data2, session));
  //               }
  //               return addNewForm(formTemplate, session);
  //             }
  //             return formTemplate;
  //           }),
  //       );
  //     });
  // }

  return Promise.all(promises)
    .then((docs) => {
      let docsIndex = 0;
      // const pageData = docs[docsIndex].toObject();
      page.sections.filter(section => section.type === 'library')
        .forEach((section) => {
          docsIndex += 1;
          section.message = docs[docsIndex];
          page.modified = latestDate(page.modified, (section.message || {}).modified);
        });
      page.sections.filter(section => section.type === 'calendar')
        .forEach((section) => {
          docsIndex += 1;
          section.events = docs[docsIndex];
          page.modified = latestDate(
            page.modified,
            section.events.map(e => e.modified)
              .reduce((d1, d2) => latestDate(d1, d2), page.modified),
          );
        });
      // if (session !== false) {
      //   page.sections.filter(section => section.type === 'form')
      //     .forEach((section) => {
      //       docsIndex += 1;
      //       section.formTemplate = docs[docsIndex];
      //       page.modified = latestDate(page.modified, section.formTemplate.modified);
      //     });
      //   // also update modified if the session is newer
      //   if (session) {
      //     page.modified = latestDate(page.modified, session.loginAt);
      //   }
      // }
      return page;
    });
};

const publicize = (data) => {
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

const preparePage = (data) => {
  data = unsetDomainIfNeeded(data);
  if (!data.path) {
    delete data.path;
    if (!data.$unset) {
      data.$unset = {};
    }
    data.$unset.path = '';
  }
  if (!data.pathAlias) {
    delete data.pathAlias;
    if (!data.$unset) {
      data.$unset = {};
    }
    data.$unset.pathAlias = '';
  }
  return data;
};

export const pagePopulations = [
  { path: 'sections.pages.id', select: 'name path', model: 'Page' },
  { path: 'sections.people.id', select: 'name image', model: 'User' },
  {
    path: 'sections.eventId',
    select: 'name path start end dates times address location ' +
      'image color modified allDay',
    model: 'Event',
  },
  { path: 'sections.libraryId', select: 'name path', model: 'Library' },
  { path: 'sections.calendarId', select: 'name path', model: 'Calendar' },
  // need this for page editing
  { path: 'sections.formTemplateId', select: 'name', model: 'FormTemplate' },
];

export default function (router) {
  router.get('/pages/:id/map', (req, res) => {
    getSession(req)
      .then(requireSomeAdministrator)
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
        const { params: { id } } = req;
        const map = pages[id];
        addParents(map, pages);
        addChildren(map, pages);
        return map;
      })
      .then(map => res.status(200).json(map))
      .catch(error => catcher(error, res));
  });

  router.post('/pages/publicize', (req, res) => {
    getSession(req)
      .then(requireAdministrator)
      .then(() => publicize())
      .then(() => res.status(200).json({}))
      .catch((error) => {
        console.error('!!! error', error);
        res.status(400).json(error);
      });
  });

  router.get('/pages/:id/:sectionId/:imageName', (req, res) => {
    const Page = mongoose.model('Page');
    const { params: { id, sectionId, imageName } } = req;
    Page.findOne({ _id: id }).exec()
      .then((page) => {
        const section = page.sections.filter(s => s._id.equals(sectionId))[0];
        if (section && section.backgroundImage.name === imageName) {
          sendImage(section.backgroundImage, res);
        } else {
          res.status(404).send();
        }
      })
      .catch(error => catcher(error, res));
  });

  register(router, {
    category: 'pages',
    modelName: 'Page',
    index: {
      authorization: allowAnyone,
      filterAuthorized: session => ({
        $or: [
          { public: true }, authorizedForDomain(session),
        ],
      }),
    },
    get: {
      pathAlias: true,
      authorization: allowAnyone,
      populate: pagePopulations,
      transformOut: (page, req, session) => {
        if (page && req.query.populate) {
          return populatePage(page, session);
        }
        return page;
      },
    },
    post: {
      authorization: requireSomeAdministrator,
    },
    put: {
      authorization: requireSomeAdministrator,
      transformIn: preparePage,
      transformOut: (data) => {
        publicize(); // don't wait
        return data;
      },
    },
    delete: {
      authorization: requireSomeAdministrator,
    },
  });
}
