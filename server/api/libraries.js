import mongoose from 'mongoose';
import register from './register';
import { authorizedAdministrator } from './auth';
import { unsetDomainIfNeeded } from './domains';

mongoose.Promise = global.Promise;

// /api/libraries

const prepareLibrary = (data) => {
  data = unsetDomainIfNeeded(data);
  if (!data.path) {
    if (!data.$unset) {
      data.$unset = {};
    }
    data.$unset.path = '';
  }
  return data;
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
        const { podcast: { image: { data, size, type } } } = library;
        // strip data url aspects. e.g. 'data:image/png;base64,'
        const string = data.slice(data.indexOf(',') + 1);
        // decode base64
        const buffer = new Buffer(string, 'base64');
        res.set({
          'Content-Type': type,
          'Content-Length': size,
        }).status(200).send(buffer);
      }
      return Promise.reject({ error: 'No image' });
    })
    .catch(error => res.status(400).json(error));
  });

  register(router, {
    category: 'libraries',
    modelName: 'Library',
    index: {
      authorize: authorizedAdministrator,
    },
    put: {
      transformIn: prepareLibrary,
      transformOut: (library) => {
        // update all Messages in this library to have the same domain
        const Message = mongoose.model('Message');
        return Message.update({ libraryId: library._id },
          { $set: { domainId: library.domainId } }, { multi: true }).exec()
          .then(() => library);
      },
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
