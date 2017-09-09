import mongoose from 'mongoose';
import register from './register';
import {
  authorizedForDomain, allowAnyone, requireAdministrator,
  requireSomeAdministrator,
} from './auth';
import { unsetDomainIfNeeded } from './domains';
import { catcher, sendImage } from './utils';

mongoose.Promise = global.Promise;

// /api/libraries

const prepareLibrary = (data) => {
  data = unsetDomainIfNeeded(data);
  if (!data.path) {
    delete data.path;
    if (!data.$unset) {
      data.$unset = {};
    }
    data.$unset.path = '';
  }
  return data;
};

const populateLibrary = (data) => {
  const Message = mongoose.model('Message');
  const library = data.toObject();
  const criteria = { libraryId: library._id };
  const query = Message.distinct('author', criteria);
  return query.exec()
    .then((authors) => {
      library.authors = authors.sort();
      return library;
    });
};

export default function (router) {
  // podcast image
  router.get('/libraries/:id/:imageName', (req, res) => {
    const id = req.params.id;
    const Library = mongoose.model('Library');
    Library.findOne({ _id: id }).populate('userId', 'name email').exec()
      .then((library) => {
        if (library.podcast && library.podcast.image &&
          library.podcast.image.name === req.params.imageName) {
          sendImage(library.podcast.image, res);
        } else {
          res.status(404).send();
        }
      })
      .catch(error => catcher(error, res));
  });

  register(router, {
    category: 'libraries',
    modelName: 'Library',
    index: {
      authorization: requireSomeAdministrator,
      filterAuthorized: authorizedForDomain,
    },
    get: {
      authorization: allowAnyone,
      transformOut: (library, req) => {
        if (library && req.query.populate) {
          return populateLibrary(library);
        }
        return library;
      },
    },
    post: {
      authorization: requireSomeAdministrator,
    },
    put: {
      authorization: requireSomeAdministrator,
      transformIn: prepareLibrary,
      transformOut: (library) => {
        // update all Messages in this library to have the same domain
        const Message = mongoose.model('Message');
        return Message.update({ libraryId: library._id },
          { $set: { domainId: library.domainId } }, { multi: true }).exec()
          .then(() => library);
      },
    },
    delete: {
      authorization: requireSomeAdministrator,
    },
  });
}

export function unsetLibraryIfNeeded(data) {
  if (!data.libraryId) {
    delete data.libraryId;
    if (!data.$unset) {
      data.$unset = {};
    }
    data.$unset.libraryId = '';
  }
  return data;
}
