"use strict";
import register from './register';
import { authorizedAdministrator } from './auth';

// /api/libraries

export default function (router) {
  register(router, 'libraries', 'Library', {
    authorize: {
      index: authorizedAdministrator
    }
  });
}

export function unsetLibraryIfNeeded (data) {
  if (! data.libraryId) {
    delete data.libraryId;
    if (! data.$unset) {
      data.$unset = {};
    }
    data.$unset.libraryId = '';
  }
  return data;
}
