import mongoose from 'mongoose';
import moment from 'moment';
import '../db';
import { loadCategoryArray, copyFile } from './utils';
import results from './results';

mongoose.Promise = global.Promise;

const LIBRARIES = [
  { name: 'Forum', path: 'forum', oldPageIds: [], parentPageId: 510 },
  { name: 'High School', path: 'high-school', oldPageIds: [214] },
  { name: 'Step Closer', path: 'step-closer', oldPageIds: [430] },
  { name: 'Women', path: 'women', oldPageIds: [495, 558] },
  { name: 'Young Adult', path: 'young-adult', oldPageIds: [431] },
];

// Library

function normalizeOldAudioFile(item) {
  item._id = new mongoose.Types.ObjectId();
  item.oldId = `${item.id}.1`; // to avoid collisions with messages
  item.name = item.audio_file_name;
  item.size = item.audio_file_size || undefined;
  item.type = item.audio_content_type;
  return item;
}

function normalizeAudioMessage(item, library, oldFile) {
  item.oldId = `${item.id}.1`; // to avoid collisions with messages
  item.created = item.created_at || undefined;
  item.modified = item.updated_at || undefined;
  item.libraryId = library._id;
  item.name = item.caption || item.verses || undefined;
  item.text = item.description || undefined;
  if (oldFile) {
    item.files = [{
      _id: oldFile._id,
      name: oldFile.name,
      size: oldFile.size,
      type: oldFile.type,
    }];
  }
  return item;
}

function normalizeMessageSeries(item, library) {
  item._id = new mongoose.Types.ObjectId();
  item.oldId = item.id;
  item.created = item.created_at || undefined;
  item.modified = item.updated_at || undefined;
  item.libraryId = library._id;
  item.series = true;
  return item;
}

function audioToOldFile(item, results) {
  const OldFile = mongoose.model('OldFile');
  return OldFile.findOne({ oldId: `${item.id}.1` }).exec()
  .then((oldFile) => {
    if (oldFile) {
      return results.skipped('OldFile', oldFile);
    }
    item = normalizeOldAudioFile(item);
    // copy before saving
    return copyFile(item,
      `audios/${item.id}/original/${item.audio_file_name}`)
    .then(() => {
      results.copied('OldFile', oldFile);
      oldFile = new OldFile(item);
      return oldFile.save()
      .then(oldFileResponse => results.saved('OldFile', oldFileResponse))
      .catch(error => results.errored('OldFile', oldFile, error));
    })
    .catch(error => results.errored('OldFile', item, error));
  });
}

export default function () {
  const Library = mongoose.model('Library');
  const Message = mongoose.model('Message');

  // load audios
  const audiosData = loadCategoryArray('audios');
  const pagesData = loadCategoryArray('pages');

  let libraryPromise = Promise.resolve();
  LIBRARIES.forEach((spec) => {

    // process libraries sequentially
    libraryPromise = libraryPromise
    .then(() => {

      console.log('!!! start', spec.name);
      let pageMessageSeries = {};
      // create Library
      return Library.findOne({ name: spec.name }).exec()
      .then(library => {
        if (library) {
          return results.skipped('Library', library);
        } else {
          const now = moment.utc().toISOString();
          const library = new Library({
            name: spec.name,
            path: spec.path,
            created: now,
            modified: now,
          });
          return library.save()
          .then(library => results.saved('Library', library))
          .catch(error => results.errored('Library', library, error));
        }
      })
      // look up child pages and create series
      .then(library => {
        if (! spec.parentPageId) {
          return library;
        } else {
          let seriesPromises = [];
          pagesData.filter(item => item.parent_id === spec.parentPageId)
          .forEach(item => {
            item = normalizeMessageSeries(item, library);
            spec.oldPageIds.push(item.id);
            const promise = Message.findOne({ oldId: item.oldId }).exec()
            .then(message => {
              if (message) {
                return results.skipped('Message', message);
              } else {
                const message = new Message(item);
                return message.save()
                .then(message => results.saved('Message', message))
                .catch(error => results.errored('Message', message, error));
              }
            })
            .then(message => pageMessageSeries[item.id] = message);
            seriesPromises.push(promise);
          });
          return Promise.all(seriesPromises).then(() => library);
        }
      })
      // copy files and remember by old id
      .then(library => {
        let sequentialFilePromise = Promise.resolve();
        audiosData.filter(item => spec.oldPageIds.indexOf(item.page_id) !== -1)
        .forEach((item, index) => {
          // run file copies sequentially to avoid running out of
          // file descriptors
          sequentialFilePromise = sequentialFilePromise
          .then(() => {
            if (99 === (index % 100)) console.log(index + 1);
            return audioToOldFile(item, results)
            .then(oldFile => {
              item = normalizeAudioMessage(item, library, oldFile);
              return Message.findOne({ oldId: `${item.id}.1` }).exec()
              .then(message => {
                if (message) {
                  return results.skipped('Message', message);
                } else {
                  const message = new Message(item);
                  if (pageMessageSeries[item.page_id]) {
                    message.seriesId = pageMessageSeries[item.page_id]._id;
                  }
                  return message.save()
                  .then(message => results.saved('Message', message))
                  .catch(error => results.errored('Message', message, error));
                }
              });
            })
            .catch(error => results.errored('OldFile', item, error));
          });
        });
        return sequentialFilePromise.then(() => library);
      });

    });
  });

  return libraryPromise
  .then(() => console.log('!!! libraries done'))
  .catch(error => console.log('!!! libraries catch', error, error.stack));
}
