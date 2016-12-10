"use strict";
import mongoose from 'mongoose';
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
      transformIn: unsetDomainIfNeeded,
      transformOut: (formTemplate) => {
        // update all Forms for this formTemplate to have the same domain
        const Form = mongoose.model('Form');
        return Form.update({ formTemplateId: formTemplate._id },
          { $set: { domainId: formTemplate.domainId } }, { multi: true }).exec()
          .then(() => formTemplate);
      }
    }
  });
}
