import express from 'express';
import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const router = express.Router();

// map old URLS to appropriate new locations

const redirectFile = (res, fileName, oldMessageId) => {
  const Message = mongoose.model('Message');
  // look for a message with the file
  Message.findOne({ 'files.name': fileName }).exec()
  .then((message) => {
    if (message) {
      let path;
      // find a file that matches
      message.files.some((file) => {
        if (file.name === fileName) {
          path = `/files/${file._id}/${file.name}`;
          return true;
        }
        return false;
      });
      // if no file matches, at least match the message
      if (!path && message.oldId === oldMessageId) {
        path = `/messages/${message._id}`;
      }
      if (path) {
        res.redirect(301, path);
      } else {
        // at least send them to the library
        res.redirect(301, '/libraries/sermon');
      }
    } else if (oldMessageId) {
      // we didn't find a file match, check for old message id
      Message.findOne({ oldId: oldMessageId }).exec()
      .then((message2) => {
        if (message2) {
          res.redirect(301, `/messages/${message2._id}`);
        } else {
          res.redirect(301, '/libraries/sermon');
        }
      });
    } else {
      res.redirect(301, '/libraries/sermon');
    }
  });
};

// /dp/stedman/romans2/3518.html
router.get('/dp/:author/:book/:fileName', (req, res) => {
  const { fileName } = req.params;
  redirectFile(res, fileName);
});

// /dp/zeisler/4079.html
router.get('/dp/:author/:fileName', (req, res) => {
  const { fileName } = req.params;
  redirectFile(res, fileName);
});

// /authors/ray-stedman
router.get('/authors/:name', (req, res) => {
  let { name } = req.params;
  name = name.replace('-', ' ');
  res.redirect(301, `/libraries/sermon?search=${encodeURIComponent(name)}`);
});

// /books/Ezekiel
router.get('/books/:name', (req, res) => {
  const { name } = req.params;
  res.redirect(301, `/libraries/sermon?search=${encodeURIComponent(name)}`);
});

// /messages/map_old_file/4714.html
router.get('/messages/map_old_file/:fileName', (req, res) => {
  const { fileName } = req.params;
  redirectFile(res, fileName);
});

// /system/message_files/6485/4539.html
router.get('/system/message_files/:oldMessageId/:fileName', (req, res) => {
  const { fileName, oldMessageId } = req.params;
  redirectFile(res, fileName, oldMessageId);
});

// /library/files/html/3527.html
router.get('/library/files/html/:fileName', (req, res) => {
  const { fileName } = req.params;
  redirectFile(res, fileName);
});

module.exports = router;
