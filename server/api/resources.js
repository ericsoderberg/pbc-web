"use strict";
import register from './register';
import { authorizedAdministrator } from './auth';

// /api/resources

export default function (router) {
  register(router, 'resources', 'Resource', {
    authorize: {
      index: authorizedAdministrator
    }
  });
}
