"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import '../db';
import { imageData, loadCategoryObject, loadCategoryArray, copyFile }
  from './utils';

// Message

function normalizeOldFile (item) {
  item._id = new mongoose.Types.ObjectId();
  item.oldId = item.id;
  item.name = item.file_file_name;
  item.size = item.file_file_size || undefined;
  item.type = item.file_content_type;
  return item;
}

function normalizeMessageSet (item, authors) {
  item._id = new mongoose.Types.ObjectId();
  item.oldId = item.id;
  item.created = item.created_at || undefined;
  item.modified = item.updated_at || undefined;
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

function normalizeMessage (item, authors, messageFiles, messageSets) {
  item.oldId = item.id;
  item.created = item.created_at || undefined;
  item.modified = item.updated_at || undefined;
  item.name = item.title;
  item.path = item.url || undefined;
  item.text = item.description || undefined;
  item.author = authors[item.author_id].name;
  item.dpId = item.dpid || undefined;
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
  .map(item2 => ({
    _id: item2._id,
    name: item2.name,
    size: item2.size,
    type: item2.type
  }));
  (messageFiles[item.id] || []).forEach(item2 => {
    if (item2 && item2.vimeo_id) {
      item.videoUrl = `https://vimeo.com/${item2.vimeo_id}`;
    }
  });
  return item;
}

function saved (doc, results) {
  results.saved += 1;
  return doc;
}

function copied (doc, results) {
  results.copied += 1;
  return doc;
}

function skipped (doc, results) {
  results.skipped += 1;
  return doc;
}

function errored (error, context, results) {
  console.log('!!! error', context, error);
  results.errors += 1;
}

function fileToOldFile (item, results) {
  const OldFile = mongoose.model('OldFile');
  return OldFile.findOne({ oldId: item.id }).exec()
  .then(oldFile => {
    if (oldFile) {
      return skipped(oldFile, results.files);
    } else {
      item = normalizeOldFile(item);
      // copy before saving
      return copyFile(item)
      .then(() => {
        copied(oldFile, results.files);
        oldFile = new OldFile(item);
        return oldFile.save()
        .then(oldFile => saved(oldFile, results.files))
        .catch(error => errored(error, 'save OldFile', results.files));
      })
      .catch(error => errored(error, 'copy file', results.files));
    }
  });
}

export default function () {
  const Message = mongoose.model('Message');
  let prePromises = [];
  let results = { saved: 0, skipped: 0, errors: 0,
    files: { copied: 0, saved: 0, skipped: 0, errors: 0 } };

  // pre-load authors, message_files, and message_sets
  const authors = loadCategoryObject('authors');

  // copy files and remember files per message
  let messageFiles = {};  // oldId => [doc, ...]
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
        .catch(error => errored(error, 'to OldFile', results.files));
      });
    }
  });
  prePromises.push(sequentialFilePromise);

  let messageSets = {}; // oldId => doc
  console.log('!!! load sets');
  loadCategoryArray('message_sets').forEach(item => {
    item = normalizeMessageSet(item, authors);
    const promise = Message.findOne({ oldId: item.oldId }).exec()
    .then(message => {
      if (message) {
        return skipped(message, results);
      } else {
        const message = new Message(item);
        return message.save()
        .then(message => saved(message, results))
        .catch(error => errored(error, 'message set', results));
      }
    })
    .then(message => messageSets[item.id] = message);
    prePromises.push(promise);
  });

  // Once we've got all of the files and series setup, do the single messages
  return Promise.all(prePromises).then(() => {
    console.log('!!! load messages');
    let messagePromises = [];
    loadCategoryArray('messages').filter(item => item).forEach(item => {
      item = normalizeMessage(item, authors, messageFiles, messageSets);
      const promise = Message.findOne({ oldId: item.oldId }).exec()
      .then(message => {
        if (message) {
          return skipped(message, results);
        } else {
          const message = new Message(item);
          return message.save()
          .then(message => saved(message, results))
          .catch(error => errored(error, 'message', results));
        }
      });
      messagePromises.push(promise);
    });
    return Promise.all(messagePromises);
  })
  // Once we've got all of the messages set up,
  // set the date for series messages to the date of the first message
  // in the series
  .then(() => {
    console.log('!!! load series');
    return Message.find().exists('series').exec()
    .then(seriesMessages => {
      let seriesPromises = [];
      seriesMessages.forEach(seriesMessage => {
        Message.findOne({ seriesId: seriesMessage.id }).sort('date').exec()
        .then(message => {
          seriesMessage.date = message.date;
          seriesPromises.push(seriesMessage.save()
            .catch(error => console.log(error)));
        });
      });
      return Promise.all(seriesPromises);
    });
  })
  .then(() => console.log('!!! Message', results))
  .catch(error => console.log('!!! Message catch', error));
}
