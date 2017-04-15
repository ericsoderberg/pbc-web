import mongoose from 'mongoose';
import register from './register';

mongoose.Promise = global.Promise;

// /api/domains

const unsetDomain = (doc) => {
  const modelNames = [
    'Page', 'Event', 'Calendar', 'Message', 'Library',
    'Form', 'Payment', 'FormTemplate',
  ];
  const promises = modelNames.map((modelName) => {
    const Doc = mongoose.model(modelName);
    return Doc.update({ domainId: doc._id }, { $unset: { domainId: '' } })
    .exec();
  });
  return Promise.all(promises).then(() => doc);
};

export default function (router) {
  register(router, {
    category: 'domains',
    modelName: 'Domain',
    delete: {
      deleteRelated: unsetDomain,
    },
  });
}

export function unsetDomainIfNeeded(data) {
  if (!data.domainId) {
    delete data.domainId;
    if (!data.$unset) {
      data.$unset = {};
    }
    data.$unset.domainId = '';
  }
  return data;
}
