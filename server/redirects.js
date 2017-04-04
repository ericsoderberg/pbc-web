import express from 'express';
import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const router = express.Router();

// map old URLS to appropriate new locations

const getDpFile = (fileName, res) => {
  const Message = mongoose.model('Message');
  const [dpId] = fileName.split('.');
  Message.findOne({ dpId }).exec()
  .then((message) => {
    if (message) {
      let path = `/messages/${message._id}`;
      // find a file that matches
      message.files.some((file) => {
        if (file.name === fileName) {
          path = `/files/${file._id}/${file.name}`;
          return true;
        }
        return false;
      });
      res.redirect(301, path);
    } else {
      res.redirect(301, '/libraries/sermon');
    }
  });
};

// /dp/stedman/romans2/3518.html
router.get('/dp/:author/:book/:fileName', (req, res) => {
  const { fileName } = req.params;
  getDpFile(fileName, res);
});

// /dp/zeisler/4079.html
router.get('/dp/:author/:fileName', (req, res) => {
  const { fileName } = req.params;
  getDpFile(fileName, res);
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
  getDpFile(fileName, res);
});

// /system/message_files/6485/4539.html
router.get('/system/message_files/:oldMessageId/:fileName', (req, res) => {
  const { fileName } = req.params;
  getDpFile(fileName, res);
});

module.exports = router;
