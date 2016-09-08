"use strict";
import register from './register';
import { authorizedAdministrator } from './auth';

// /api/domains

export default function (router) {
  register(router, 'domains', 'Domain', {
    authorize: {
      index: authorizedAdministrator
    }
  });
}
