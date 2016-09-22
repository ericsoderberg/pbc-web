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

export function unsetDomainIfNeeded (data) {
  if (! data.domainId) {
    delete data.domainId;
    if (! data.$unset) {
      data.$unset = {};
    }
    data.$unset.domainId = '';
  }
  return data;
}
