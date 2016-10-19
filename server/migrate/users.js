"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import '../db';
import { imageData, loadCategoryArray } from './utils';
import results from './results';

// User

function normalizeUser (item) {
  item.oldId = item.id;
  if (! item.name) {
    item.name = '?';
  }
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
  return item;
}

export default function () {
  const User = mongoose.model('User');
  let promises = [];

  loadCategoryArray('users').forEach(item => {
    const promise = User.findOne({ oldId: item.id }).exec()
    .then(user => {
      if (user) {
        return results.skipped('User', user);
      } else {
        item = normalizeUser(item);
        const user = new User(item);
        return user.save()
        .then((user) => results.saved('User', user))
        .catch(error => results.errored('User', user, error));
      }
    });
    promises.push(promise);
  });

  return Promise.all(promises)
  .then(() => console.log('!!! users done'))
  .catch(error => console.log('!!! users catch', error, error.stack));
}
