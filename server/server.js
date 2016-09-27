"use strict";
import compression from 'compression';
import express from 'express';
import http from "http";
import morgan from 'morgan';
import bodyParser from 'body-parser';
import busboy from 'connect-busboy';
import cookieParser from 'cookie-parser';
import path from 'path';
import api from './api';
import rss from './rss';

const PORT = process.env.PORT || 8091;
const app = express();
const router = express.Router();

app.use(compression())
  .use(cookieParser())
  .use(morgan('tiny'))
  .use(bodyParser.json({limit: '16mb'})) // allow for embedded images
  .use(busboy())
  .use('', router)
  .use('/api', api)
  .use('/', rss)
  .use('/', express.static(path.join(__dirname, '/../dist')))
  .get('/*', function (req, res) {
    res.sendFile(path.resolve(path.join(__dirname, '/../dist/index.html')));
  });

const server = http.createServer(app);
server.listen(PORT);
console.log(`Server started, listening at: http://localhost:${PORT}...`);
