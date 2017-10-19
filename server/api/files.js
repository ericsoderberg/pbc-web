import mongoose from 'mongoose';
import fs from 'fs';
import rmdir from 'rimraf';
import mime from 'mime-types';
import { getSession, requireAdministrator, requireSomeAdministrator } from './auth';
import { catcher } from './utils';

mongoose.Promise = global.Promise;

export const FILES_PATH = `${__dirname}/../../public/files`;

// /api/files

export default function (router) {
  router.get('/files/:id/:name', (req, res) => {
    const { id, name } = req.params;

    const path = `${FILES_PATH}/${id}/${name}`;
    const stat = fs.statSync(path);
    const size = stat.size;
    const mimeType = mime.lookup(path);

    if (req.headers.range) {
      // byte range request, likely due to audio scrubbing

      const range = req.headers.range;
      const [startPart, endPart] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startPart, 10);
      const end = endPart ? parseInt(endPart, 10) : size - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType });
      const readStream = fs.createReadStream(path, { start, end });
      readStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': size,
      });
      const readStream = fs.createReadStream(path);
      readStream.pipe(res);
    }
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
    getSession(req)
      .then(requireSomeAdministrator)
      .then(() => {
        const id = req.params.id;
        rmdir(`${FILES_PATH}/${id}`, (error) => {
          if (error) {
            res.status(400).json(error);
          } else {
            res.status(200).send();
          }
        });
      })
      .catch(error => catcher(error, res));
  });

  router.get('/files', (req, res) => {
    getSession(req)
      .then(requireAdministrator)
      .then(() => {
        fs.readdir(`${FILES_PATH}`, (error, files) => {
          if (error) {
            return Promise.reject({ status: 400, error });
          }
          // sort by modification time
          let start = 0;
          if (req.query.skip) {
            start = parseInt(req.query.skip, 10);
          }
          files = files.slice(start, start + 20);
          files = files.map(id => ({ _id: id }));
          res.status(200).json(files);
          return Promise.resolve();
        });
      })
      .catch(error => catcher(error, res));
  });

  router.post('/files', (req, res) => {
    getSession(req)
      .then(requireSomeAdministrator)
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
      })
      .catch(error => catcher(error, res));
  });
}
