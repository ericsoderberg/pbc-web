"use strict";
import fs from 'fs';
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import './db';

const SOURCE_DIR = '/Users/ericsoderberg/Downloads/pbc3/';
const FILES_PATH = 'public/files';

function imageData (category, id, name, type) {
  const binaryData =
    fs.readFileSync(`${SOURCE_DIR}system/${category}/${id}/original/${name}`);
  const base64Data = new Buffer(binaryData, 'binary').toString('base64');
  return `data:${type};base64,${base64Data}`;
}

function loadCategoryObject (category) {
  const result = {};
  let data = fs.readFileSync(`${SOURCE_DIR}${category}.json`, 'utf8');
  data.split("\n").filter(item => item).map(item => {
    item = JSON.parse(item);
    result[item.id] = item;
  });
  return result;
}

function loadCategoryArray (category) {
  let data = fs.readFileSync(`${SOURCE_DIR}${category}.json`, 'utf8');
  return data.split("\n").filter(item => item).map(item => JSON.parse(item));
}

// User

if (false) {
  const User = mongoose.model('User');

  fs.readFile(`${SOURCE_DIR}users.json`, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }

    const items = data.split("\n");
    console.log('!!! found', items.length);
    items.filter(item => item).forEach(item => {
      item = JSON.parse(item);

      // convert for schema
      item.created = item.created_at;
      item.modified = item.updated_at;
      if (item.portrait_file_size) {
        item.avatar = {
          data: imageData('portraits', item.id, item.portrait_file_name,
            item.portrait_content_type),
          name: item.portrait_file_name,
          size: item.portrait_file_size,
          type: item.portrait_content_type
        };
      } else if (item.avatar_file_size) {
        item.avatar = {
          data: imageData('avatars', item.id, item.avatar_file_name,
            item.portrait_content_type),
          name: item.avatar_file_name,
          size: item.avatar_file_size,
          type: item.avatar_content_type
        };
      }
      item.encryptedPassword = item.encrypted_password;
      item.text = item.bio;

      const user = new User(item);
      user.save()
      .catch(error => console.log(error));
      console.log('!!! saved', user.name);
    });
  });
}

// Message

if (false) {
  const Message = mongoose.model('Message');

  // pre-load authors, message_files, and message_sets
  const authors = loadCategoryObject('authors');

  // copy files and build files per message
  const messageFiles = {};
  loadCategoryArray('message_files')
  .filter(item => item)
  .forEach(item => {
    const name = item.file_file_name;

    if (name) {
      const oldPath = `${SOURCE_DIR}system/message_files/${item.id}/${name}`;
      // move to new location
      if (! fs.existsSync(oldPath)) {
        console.log('! Missing', oldPath);
      } else {
        const _id = new mongoose.Types.ObjectId();
        item._id = _id;
        fs.mkdirSync(`${FILES_PATH}/${_id}`);
        fs.rename(oldPath, `${FILES_PATH}/${_id}/${name}`);
      }
    }

    if (! messageFiles[item.message_id]) {
      messageFiles[item.message_id] = [];
    }
    messageFiles[item.message_id].push(item);
  });

  const messageSets = {};
  loadCategoryArray('message_sets').filter(item => item).forEach(item => {

    // convert for schema
    item._id = new mongoose.Types.ObjectId();
    item.created = item.created_at || undefined;
    item.modified = item.updated_at || undefined;
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

    const message = new Message(item);
    message.save()
    .catch(error => console.log(error));

    messageSets[item.id] = item;
  });

  fs.readFile(`${SOURCE_DIR}messages.json`, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }

    const items = data.split("\n");
    console.log('!!! found', items.length, 'messages');
    items.filter(item => item).forEach(item => {
      item = JSON.parse(item);

      // convert for schema
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
      .filter(item2 => item2.file_file_name)
      .map(item2 => ({
        _id: item2._id,
        name: item2.file_file_name,
        size: item2.file_file_size || undefined,
        type: item2.file_content_type
      }));
      (messageFiles[item.id] || []).forEach(item2 => {
        if (item2.vimeo_id) {
          item.videoUrl = `https://vimeo.com/${item2.vimeo_id}`;
        }
      });

      const message = new Message(item);
      console.log('!!! saved', item.name);
      message.save()
      .catch(error => console.log(error));
    });
  });
}
