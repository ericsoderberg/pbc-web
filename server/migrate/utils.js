"use strict";
import fs from 'fs';

export var SOURCE_DIR = '/Users/ericsoderberg/Downloads/pbc3/';
const FILES_PATH = `${__dirname}/../../public/files`;

// http://dba.stackexchange.com/a/147827
export function descape (string) {
  return string.replace(/\\\\/g, '\\');
}

export function imageData (category, id, name, type) {
  const binaryData =
    fs.readFileSync(`${SOURCE_DIR}system/${category}/${id}/original/${name}`);
  const base64Data = new Buffer(binaryData, 'binary').toString('base64');
  return `data:${type};base64,${base64Data}`;
}

export function loadCategoryObject (category) {
  const result = {};
  let data = fs.readFileSync(`${SOURCE_DIR}${category}.json`, 'utf8');
  data.split("\n").filter(item => item).map(item => {
    item = descape(item);
    item = JSON.parse(item);
    result[item.id] = item;
  });
  return result;
}

export function loadCategoryArray (category) {
  let data = fs.readFileSync(`${SOURCE_DIR}${category}.json`, 'utf8');
  return data.split("\n").filter(item => item).map(item => {
    item = descape(item);
    return JSON.parse(item);
  });
}

export function copyFile (item, subPath) {
  return new Promise((resolve, reject) => {
    const oldPath = `${SOURCE_DIR}system/${subPath}`;
    if (! fs.existsSync(oldPath)) {
      reject(`!!! Missing ${oldPath}`);
    } else {
      fs.mkdirSync(`${FILES_PATH}/${item._id}`);
      const newPath = `${FILES_PATH}/${item._id}/${item.name}`;
      const reader = fs.createReadStream(oldPath);
      reader.on("error", (error) => reject(error));
      const writer = fs.createWriteStream(newPath);
      writer.on("error", (error) => reject(error));
      writer.on("close", (ex) => resolve(item));
      reader.pipe(writer);
    }
  });
}
