"use strict";
import register from './register';
import { authorizedForDomain } from './auth';
import { unsetDomainIfNeeded } from './domains';

// /api/form-templates

export default function (router) {
  register(router, {
    category: 'form-templates',
    modelName: 'FormTemplate',
    index: {
      authorize: authorizedForDomain
    },
    put: {
      transformIn: unsetDomainIfNeeded
    }
  });
}
