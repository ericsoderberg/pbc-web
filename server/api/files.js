import mongoose from 'mongoose';
import fs from 'fs';
import rmdir from 'rimraf';
import mime from 'mime';
import { authorize } from './auth';

mongoose.Promise = global.Promise;

export const FILES_PATH = `${__dirname}/../../public/files`;

// /api/files

export default function (router) {
  router.get('/files/:id/:name', (req, res) => {
    const { id, name } = req.params;

    const path = `${FILES_PATH}/${id}/${name}`;
    const stat = fs.statSync(path);
    res.writeHead(200, {
      'Content-Type': mime.lookup(path),
      'Content-Length': stat.size,
    });

    const readStream = fs.createReadStream(path);
    readStream.pipe(res);

    // res.download(`${FILES_PATH}/${id}/${name}`);
  });

  router.get('/files/:id', (req, res) => {
    const id = req.params.id;
    fs.readdir(`${FILES_PATH}/${id}`, (error, files) => {
      if (error) {
        res.status(400).json(error);
      } else {
        const path = `${FILES_PATH}/${id}/${files[0]}`;
        const stat = fs.statSync(path);
        res.writeHead(200, {
          'Content-Type': mime.lookup(path),
          'Content-Length': stat.size,
        });

        const readStream = fs.createReadStream(path);
        readStream.pipe(res);

        // res.download(`${FILES_PATH}/${id}/${files[0]}`);
      }
    });
  });

  router.delete('/files/:id', (req, res) => {
    authorize(req, res)
    .then(() => {
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
    .then(() => {
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
    .then(() => {
      const id = new mongoose.Types.ObjectId();
      let fstream;
      req.busboy.on('file',
        (fieldname, file, filename, encoding, mimetype) => {
          const dir = `${FILES_PATH}/${id}`;
          fs.mkdir(dir, () => {
            const path = `${dir}/${filename}`;
            fstream = fs.createWriteStream(path);
            file.pipe(fstream);
            fstream.on('close', () => {
              const stat = fs.statSync(path);
              res.json({ _id: id, name: filename, size: stat.size, type: mimetype });
            });
          });
        });
      req.pipe(req.busboy);
    });
  });
}
