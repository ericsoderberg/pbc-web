"use strict";

function imageData (category, id, name, type) {
  const binaryData =
    fs.readFileSync(`${SOURCE_DIR}system/${category}/${id}/original/${name}`);
  const base64Data = new Buffer(binaryData, 'binary').toString('base64');
  return `data:${type};base64,${base64Data}`;
}

// User

export function normalizeUser (item) {
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

// Message

export function normalizeMessageSet (item, authors) {
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

export function normalizeMessage (item, authors, messageFiles, messageSets) {
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
  return item;
}

// Event + Resource

export function normalizeResource (item) {
  item._id = new mongoose.Types.ObjectId();
  item.created = item.created_at || undefined;
  item.modified = item.updated_at || undefined;
  return item;
}

export function normalizeEvent (item, slaveEvents, reservations) {
  item.created = item.created_at;
  item.modified = item.updated_at;
  item.text = item.notes;
  item.start = item.start_at;
  item.end = item.stop_at;
  item.dates = (slaveEvents[item.id] || []).map(item2 => item2.start_at);
  item.resourceIds = (reservations[item.id] || []);
  return item;
}
