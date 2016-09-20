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
