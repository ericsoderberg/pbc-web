import mongoose from 'mongoose';
import moment from 'moment';
import '../db';
import { imageData, loadCategoryArray, copyFile } from './utils';
import results from './results';

mongoose.Promise = global.Promise;

// Page

function normalizePage(item, arg) {
  const {
    styles, contacts, userIds, photos, pageFiles, events, eventDocs,
    forms, formTemplateIds,
  } = arg;
  item.oldId = item.id;
  item.created = item.created_at || undefined;
  item.modified = item.updated_at || undefined;
  item.sections = [];

  if (item.style_id) {
    const style = styles[item.style_id];
    if (style.banner_file_name) {
      const image = {
        data: imageData('banners', style.id, style.banner_file_name,
          style.banner_content_type),
        name: style.banner_file_name,
        size: style.banner_file_size || undefined,
        type: style.banner_content_type,
      };
      item.sections.push({ image, type: 'image' });
    }
  }

  if (item.text) {
    item.sections.push({ text: item.text, type: 'text' });
  }

  if ((!item.aspect_order || item.aspect_order.indexOf('c') !== -1) &&
    contacts[item.id]) {
    const people = contacts[item.id].map((item2) => {
      let image;
      if (item2.portrait_file_name) {
        image = {
          data: imageData('portraits', item2.id, item2.portrait_file_name,
            item2.portrait_content_type),
          name: item2.portrait_file_name,
          size: item2.portrait_file_size || undefined,
          type: item2.portrait_content_type,
        };
      }
      return {
        id: userIds[item2.user_id],
        image,
        text: `${item2.role ? `### ${item2.role}` : ''} ${item2.bio}`,
      };
    });
    item.sections.push({ people, type: 'people' });
  }

  if ((!item.aspect_order || item.aspect_order.indexOf('e') !== -1) &&
    events[item.id]) {
    const lastWeek = moment().subtract(1, 'week');
    events[item.id]
    .filter((item2) => {
      const event = eventDocs[item2.id];
      return (events[item.id].length <= 2 ||
        moment(event.start).isAfter(lastWeek));
    })
    .forEach((item2) => {
      if (eventDocs[item2.id]._id) {
        item.sections.push({ eventId: eventDocs[item2.id]._id, type: 'event' });
      }
    });
  }

  if ((!item.aspect_order || item.aspect_order.indexOf('p') !== -1) &&
    photos[item.id]) {
    let totalSize = 0;
    photos[item.id].forEach((item2) => {
      // stop if we've got too many
      totalSize += item2.photo_file_size;
      if (item2.photo_file_name && totalSize < 12000000) {
        const image = {
          data: imageData('photos', item2.id, item2.photo_file_name,
            item2.photo_content_type),
          name: item2.photo_file_name,
          size: item2.photo_file_size || undefined,
          type: item2.photo_content_type,
        };
        item.sections.push({ image, type: 'image' });
      }
    });
  }

  if (pageFiles[item.id]) {
    const files = pageFiles[item.id].filter(item2 => item2).map(item2 => ({
      _id: item2._id,
      label: item2.label,
      name: item2.name,
      size: item2.size,
      type: item2.type,
    }));
    item.sections.push({ files, type: 'files' });
  }

  if ((!item.aspect_order || item.aspect_order.indexOf('f') !== -1) &&
    forms[item.id]) {
    forms[item.id].filter(item2 => item2.published).forEach((item2) => {
      item.sections.push({
        formTemplateId: formTemplateIds[item2.id], type: 'form',
      });
    });
  }

  return item;
}

function normalizeOldFile(item, oldId) {
  item._id = new mongoose.Types.ObjectId();
  item.oldId = oldId;
  item.label = item.name;
  item.name = item.file_file_name;
  item.size = item.file_file_size || undefined;
  item.type = item.file_content_type;
  return item;
}

function fileToOldFile(item, results) {
  const OldFile = mongoose.model('OldFile');
  const oldId = `pf-${item.id}`;
  return OldFile.findOne({ oldId }).exec()
  .then((oldFile) => {
    if (oldFile) {
      return results.skipped('OldFile', oldFile);
    }
    item = normalizeOldFile(item, oldId);
    // copy before saving
    return copyFile(item, `files/${item.id}/original/${item.file_file_name}`)
    .then(() => {
      results.copied('OldFile', oldFile);
      oldFile = new OldFile(item);
      return oldFile.save()
      .then(oldFileSaved => results.saved('OldFile', oldFileSaved))
      .catch(error => results.errored('OldFile', oldFile, error));
    })
    .catch(error => results.errored('OldFile', item, error));
  });
}

export default function () {
  const Page = mongoose.model('Page');
  const User = mongoose.model('User');
  const Event = mongoose.model('Event');
  const FormTemplate = mongoose.model('FormTemplate');
  const pages = {}; // oldId => doc
  const childOldIds = {}; // oldId => [oldId, ...]
  const contacts = {}; // oldId => [item, ...]
  const photos = {}; // oldId => [item, ...]
  const styles = {}; // oldId => item
  const userIds = {}; // oldId => _id
  const events = {}; // oldId => [item, ...]
  const eventDocs = {}; // oldId => doc
  const forms = {}; // oldId => [item, ...]
  const formTemplateIds = {}; // oldId => _id
  const pageFiles = {};  // oldId => [doc, ...]
  const pagesData = loadCategoryArray('pages');

  return Promise.resolve()
  .then(() => {
    loadCategoryArray('contacts').forEach((item) => {
      if (!contacts[item.page_id]) {
        contacts[item.page_id] = [];
      }
      contacts[item.page_id].push(item);
    });
  })
  .then(() => {
    console.log('!!! find Users');
    // load Users so we can map ids
    return User.find({}).select('oldId').exec()
    .then(users => users.filter(user => user.oldId)
      .forEach((user) => { userIds[user.oldId] = user._id; }),
    );
  })
  .then(() => {
    loadCategoryArray('styles').forEach((item) => { styles[item.id] = item; });
  })
  .then(() => {
    loadCategoryArray('events')
    // only master events
    .filter(item => (!item.master_id || item.master_id === item.id))
    .forEach((item) => {
      if (!events[item.page_id]) {
        events[item.page_id] = [];
      }
      events[item.page_id].push(item);
    });
  })
  .then(() => {
    console.log('!!! find Events');
    // load Events so we can map ids and check start date
    return Event.find({}).select('oldId start').exec()
    .then(eventsFound => eventsFound.filter(event => event.oldId)
      .forEach((event) => { eventDocs[event.oldId] = event; }),
    );
  })
  .then(() => {
    loadCategoryArray('forms')
    .forEach((item) => {
      if (!forms[item.page_id]) {
        forms[item.page_id] = [];
      }
      forms[item.page_id].push(item);
    });
  })
  .then(() => {
    console.log('!!! find FormTemplates');
    // load Events so we can map ids
    return FormTemplate.find({}).select('oldId').exec()
    .then(formTemplates => (
      formTemplates.filter(formTemlate => formTemlate.oldId))
      .forEach(formTemlate => (
        formTemplateIds[formTemlate.oldId] = formTemlate._id)),
    );
  })
  .then(() => {
    loadCategoryArray('photos').forEach((item) => {
      if (!photos[item.page_id]) {
        photos[item.page_id] = [];
      }
      photos[item.page_id].push(item);
    });
  })
  .then(() => {
    // copy files and remember files per page
    let sequentialFilePromise = Promise.resolve();
    console.log('!!! load files');
    loadCategoryArray('documents').forEach((item, index) => {
      if (!pageFiles[item.page_id]) {
        pageFiles[item.page_id] = [];
      }
      // run file copies sequentially to avoid running out of file descriptors
      sequentialFilePromise = sequentialFilePromise
      .then(() => {
        if ((index % 100) === 99) console.log(index + 1);
        return fileToOldFile(item, results)
        .then(oldFile => pageFiles[item.page_id].push(oldFile))
        .catch(error => results.errored('OldFile', item, error));
      });
    });
    return sequentialFilePromise;
  })
  .then(() => {
    const pagePromises = [];
    pagesData.forEach((item) => {
      if (item.parent_id && !item.private && !item.obscure) {
        if (!childOldIds[item.parent_id]) {
          childOldIds[item.parent_id] = [];
        }
        if (childOldIds[item.parent_id].indexOf(item.id) === -1) {
          childOldIds[item.parent_id].push(item.id);
        }
      }

      const promise = Page.findOne({ oldId: item.id }).exec()
      .then((page) => {
        if (page) {
          return results.skipped('Page', page);
        }
        item = normalizePage(item, {
          styles, contacts, userIds, photos, pageFiles, events, eventDocs,
          forms, formTemplateIds,
        });
        page = new Page(item);
        return page.save()
        .then(pageSaved => results.saved('Page', pageSaved))
        .catch(error => results.errored('Page', page, error));
      })
      .then((page) => { pages[item.id] = page; });

      pagePromises.push(promise);
    });

    return Promise.all(pagePromises);
  })
  // // Once we've got all of the pages set up,
  // // link pages together by parent id
  // .then(() => {
  //   console.log('!!! link pages');
  //   const linkPromises = [];
  //   pagesData.forEach((item) => {
  //     if (childOldIds[item.id]) {
  //       const page = pages[item.id];
  //       // check to see if we've already done this
  //       if (!page.sections.some(s => s.type === 'pages')) {
  //         page.sections.push({
  //           pages: childOldIds[item.id].map(oldId => ({
  //             id: pages[oldId]._id })),
  //           type: 'pages',
  //         });
  //         linkPromises.push(page.save());
  //       }
  //     }
  //   });
  //   return Promise.all(linkPromises);
  // })
  .then(() => console.log('!!! pages done'))
  .catch(error => console.log('!!! pages catch', error, error.stack));
}
