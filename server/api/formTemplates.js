import mongoose from 'mongoose';
import register from './register';
import { authorizedForDomain } from './auth';
import { unsetDomainIfNeeded } from './domains';

mongoose.Promise = global.Promise;

// /api/form-templates

const unsetReferences = (data) => {
  data = unsetDomainIfNeeded(data);
  if (!data.dependsOnId) {
    delete data.dependsOnId;
    if (!data.$unset) {
      data.$unset = {};
    }
    data.$unset.dependsOnId = '';
  }
  return data;
};


export default function (router) {
  register(router, {
    category: 'form-templates',
    modelName: 'FormTemplate',
    index: {
      authorize: authorizedForDomain,
      populate: [
        { path: 'dependsOnId', select: 'name' },
      ],
    },
    get: {
      populate: [
        { path: 'dependsOnId', select: 'name' },
      ],
    },
    put: {
      transformIn: unsetReferences,
      transformOut: (formTemplate) => {
        // update all Forms for this formTemplate to have the same domain
        const Form = mongoose.model('Form');
        return Form.update({ formTemplateId: formTemplate._id },
          { $set: { domainId: formTemplate.domainId } }, { multi: true }).exec()
          .then(() => formTemplate);
      },
    },
  });
}
