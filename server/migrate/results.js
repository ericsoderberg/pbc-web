"use strict";

let results = {};

function saved (context, doc) {
  if (! results[context]) {
    results[context] = {};
  }
  if (! results[context].saved) {
    results[context].saved = 0;
  }
  results[context].saved += 1;
  return doc;
}

function copied (context, doc) {
  if (! results[context]) {
    results[context] = {};
  }
  if (! results[context].copied) {
    results[context].copied = 0;
  }
  results[context].copied += 1;
  return doc;
}

function replaced (context, doc) {
  if (! results[context]) {
    results[context] = {};
  }
  if (! results[context].replaced) {
    results[context].replaced = 0;
  }
  results[context].replaced += 1;
  return doc;
}

function skipped (context, doc) {
  if (! results[context]) {
    results[context] = {};
  }
  if (! results[context].skipped) {
    results[context].skipped = 0;
  }
  results[context].skipped += 1;
  return doc;
}

function errored (context, item, error) {
  console.log('!!! error', item, error, error.stack);
  if (! results[context]) {
    results[context] = {};
  }
  if (! results[context].errors) {
    results[context].errors = 0;
  }
  results[context].errors += 1;
}

function log () {
  return results;
}

export default {
  saved: saved,
  copied: copied,
  replaced: replaced,
  skipped: skipped,
  errored: errored,
  log: log
};
