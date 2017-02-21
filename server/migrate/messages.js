"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import '../db';
import { imageData, loadCategoryObject, loadCategoryArray, copyFile }
  from './utils';
import results from './results';

// Message

const LIBRARY_NAME = 'Sermon';

function normalizeOldFile (item) {
  item._id = new mongoose.Types.ObjectId();
  item.oldId = item.id;
  item.label = item.caption;
  item.name = item.file_file_name;
  item.size = item.file_file_size || undefined;
  item.type = item.file_content_type;
  return item;
}

function normalizeMessageSet (item, mainLibrary, authors) {
  item._id = new mongoose.Types.ObjectId();
  item.oldId = item.id;
  item.created = item.created_at || undefined;
  item.modified = item.updated_at || undefined;
  item.libraryId = mainLibrary._id;
  item.series = true;
  item.name = item.title;
  item.path = item.url || undefined;
  item.text = item.description || undefined;
  item.author = item.author_id ? authors[item.author_id].name : undefined;
  if (item.image_file_name) {
    item.image = {
      data: imageData('images', item.id, item.image_file_name,
        item.image_content_type),
      name: item.image_file_name,
      size: item.image_file_size || undefined,
      type: item.image_content_type
    };
  }
  return item;
}

function normalizeMessage (item, mainLibrary, authors, messageFiles,
  messageSets) {
  item.oldId = item.id;
  item.created = item.created_at || undefined;
  item.modified = item.updated_at || undefined;
  item.libraryId = mainLibrary._id;
  item.name = item.title;
  item.path = item.url || undefined;
  item.text = item.description || undefined;
  item.author = authors[item.author_id].name;
  item.dpId = item.dpid || undefined;

  // normalize verses, remove abbreviations
  item.verses = item.verses.replace('Gen ', 'Genesis ');
  item.verses = item.verses.replace('Num ', 'Numbers ');
  item.verses = item.verses.replace('Deut ', 'Deuteronomy ');
  item.verses = item.verses.replace('Sam ', 'Samuel ');
  item.verses = item.verses.replace('Chr ', 'Chronicles ');
  item.verses = item.verses.replace('Pro ', 'Proverbs ');
  item.verses = item.verses.replace('Eccl. ', 'Ecclesiastes ');
  item.verses = item.verses.replace('Isa ', 'Isaiah ');
  item.verses = item.verses.replace('Hab ', 'Habakkuk ');
  item.verses = item.verses.replace('Rom ', 'Romans ');
  item.verses = item.verses.replace('Cor ', 'Corinthians ');
  item.verses = item.verses.replace('Cor.', 'Corinthians');
  item.verses = item.verses.replace('Eph ', 'Ephesians ');
  item.verses = item.verses.replace('Col ', 'Colossians ');
  item.verses = item.verses.replace('Thes ', 'Thessalonians ');
  item.verses = item.verses.replace('Tim ', 'Timothy ');
  item.verses = item.verses.replace('Heb ', 'Hebrews ');
  item.verses = item.verses.replace('Pet ', 'Peter ');
  item.verses = item.verses.replace('Rev ', 'Revelation ');

  if (item.image_file_name) {
    item.image = {
      data: imageData('images', item.id, item.image_file_name,
        item.image_content_type),
      name: item.image_file_name,
      size: item.image_file_size || undefined,
      type: item.image_content_type
    };
  }

  if (item.message_set_id) {
    item.seriesId = messageSets[item.message_set_id]._id;
  }

  item.files = (messageFiles[item.id] || [])
  .filter(item2 => item2 && item2.name)
  .map((item2) => {
    let label;
    if (item2.name.indexOf('_SQ_') !== -1) {
      label = 'Questions';
    } else if (item2.name.indexOf('_WEB_Format') !== -1) {
      label = 'Message';
    }
    return {
      _id: item2._id,
      label: item2.label || label,
      name: item2.name,
      size: item2.size,
      type: item2.type
    };
  });

  (messageFiles[item.id] || []).forEach(item2 => {
    if (item2 && item2.vimeo_id) {
      item.videoUrl = `https://vimeo.com/${item2.vimeo_id}`;
    }
  });

  return item;
}

function fileToOldFile (item, results) {
  const OldFile = mongoose.model('OldFile');
  return OldFile.findOne({ oldId: item.id }).exec()
  .then(oldFile => {
    if (oldFile) {
      return results.skipped('OldFile', oldFile);
    } else {
      item = normalizeOldFile(item);
      // copy before saving
      return copyFile(item, `message_files/${item.id}/${item.file_file_name}`)
      .then(() => {
        results.copied('OldFile', oldFile);
        oldFile = new OldFile(item);
        return oldFile.save()
        .then(oldFile => results.saved('OldFile', oldFile))
        .catch(error => results.errored('OldFile', oldFile, error));
      })
      .catch(error => results.errored('OldFile', item, error));
    }
  });
}

export default function () {
  const Library = mongoose.model('Library');
  const Message = mongoose.model('Message');

  // load authors
  const authors = loadCategoryObject('authors');
  let mainLibrary; // doc
  let messageFiles = {};  // oldId => [doc, ...]
  let messageSets = {}; // oldId => doc

  // create library, if needed
  return Library.findOne({ name: LIBRARY_NAME }).exec()
  .then(library => {
    if (library) {
      return results.skipped('Library', library);
    } else {
      const library = new Library({ name: LIBRARY_NAME });
      return library.save()
      .then(library => results.saved('Library', library))
      .catch(error => results.errored('Library', library, error));
    }
  })
  .then(library => mainLibrary = library)
  .then(() => {
    // copy files and remember files per message
    let sequentialFilePromise = Promise.resolve();
    console.log('!!! load files');
    loadCategoryArray('message_files').forEach((item, index) => {
      if (! messageFiles[item.message_id]) {
        messageFiles[item.message_id] = [];
      }
      const name = item.file_file_name;
      // only copy actual files, not external videos
      if (! name) {
        // so message can map video url
        messageFiles[item.message_id].push(item);
      } else {
        // run file copies sequentially to avoid running out of file descriptors
        sequentialFilePromise = sequentialFilePromise
        .then(() => {
          if (99 === (index % 100)) console.log(index + 1);
          return fileToOldFile(item, results)
          .then(oldFile => messageFiles[item.message_id].push(oldFile))
          .catch(error => results.errored('OldFile', item, error));
        });
      }
    });
    return sequentialFilePromise;
  })
  .then(() => {
    console.log('!!! load sets');
    let messageSetPromises = [];
    loadCategoryArray('message_sets').forEach(item => {
      item = normalizeMessageSet(item, mainLibrary, authors);
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
      .then(message => messageSets[item.id] = message);
      messageSetPromises.push(promise);
    });
    return Promise.all(messageSetPromises);
  })
  .then(() => {
    // Once we've got all of the files and series setup, do the single messages
    console.log('!!! load messages');
    let messagePromises = [];
    loadCategoryArray('messages').filter(item => item).forEach(item => {
      item = normalizeMessage(item, mainLibrary, authors, messageFiles,
        messageSets);
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
      });
      messagePromises.push(promise);
    });
    return Promise.all(messagePromises);
  })
  // Once we've got all of the messages set up,
  // set the date for series messages to the date of the last message
  // in the series
  .then(() => {
    console.log('!!! load series');
    return Message.find().exists('series').exec()
    .then(seriesMessages => {
      let seriesPromises = [];
      seriesMessages.forEach(seriesMessage => {
        Message.findOne({ seriesId: seriesMessage.id }).sort('-date').exec()
        .then(message => {
          seriesMessage.date = message.date;
          seriesPromises.push(seriesMessage.save()
            .catch(error => console.log(error)));
        });
      });
      return Promise.all(seriesPromises);
    });
  })
  .then(() => console.log('!!! messages done'))
  .catch(error => console.log('!!! messages catch', error, error.stack));
}
