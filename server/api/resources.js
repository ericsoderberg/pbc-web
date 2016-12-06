"use strict";
import register from './register';
import { authorizedAdministrator } from './auth';

// /api/resources

export default function (router) {
  register(router, {
    category: 'resources',
    modelName: 'Resource',
    index: {
      authorize: authorizedAdministrator
    }
  });
}
