"use strict";
import mongoose from 'mongoose';
import fs from 'fs';
import rmdir from 'rimraf';
import { authorize } from './auth';

export var FILES_PATH = 'public/files';

// /api/files

export default function (router) {
  router.get('/files/:id/:name', (req, res) => {
    const { id, name } = req.params;
    res.download(`${FILES_PATH}/${id}/${name}`);
  });

  router.get('/files/:id', (req, res) => {
    const id = req.params.id;
    fs.readdir(`${FILES_PATH}/${id}`, (error, files) => {
      if (error) {
        res.status(400).json(error);
      } else {
        res.download(`${FILES_PATH}/${id}/${files[0]}`);
      }
    });
  });

  router.delete('/files/:id', (req, res) => {
    authorize(req, res)
    .then(session => {
      const id = req.params.id;
      rmdir(`${FILES_PATH}/${id}`, (error) => {
        if (error) {
          res.status(400).json(error);
        } else {
          res.status(200).send();
        }
      });
    });
  });

  router.get('/files', (req, res) => {
    authorize(req, res)
    .then(session => {
      fs.readdir(`${FILES_PATH}`, (error, files) => {
        if (error) {
          res.status(400).json(error);
        } else {
          let start = 0;
          if (req.query.skip) {
            start = parseInt(req.query.skip, 10);
          }
          files = files.slice(start, start + 20);
          files = files.map(id => ({ _id: id }));
          res.status(200).json(files);
        }
      });
    });
  });

  router.post('/files', (req, res) => {
    authorize(req, res)
    .then(session => {
      const id = new mongoose.Types.ObjectId();
      let fstream;
      req.busboy.on('file',
        function (fieldname, file, filename, encoding, mimetype) {
          const dir = `${FILES_PATH}/${id}`;
          fs.mkdir(dir, () => {
            fstream = fs.createWriteStream(`${dir}/${filename}`);
            file.pipe(fstream);
            fstream.on('close', function () {
              res.json({ _id: id, name: filename, type: mimetype });
            });
          });
        });
      req.pipe(req.busboy);
    });
  });
}
