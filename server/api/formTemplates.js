"use strict";
import register from './register';
import { authorizedForDomain } from './auth';
import { unsetDomainIfNeeded } from './domains';

// /api/form-templates

export default function (router) {
  register(router, 'form-templates', 'FormTemplate', {
    authorize: {
      index: authorizedForDomain
    },
    transformIn: {
      put: unsetDomainIfNeeded
    }
  });
}
