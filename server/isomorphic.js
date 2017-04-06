import express from 'express';
import ejs from 'ejs';
import fs from 'fs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from '../dist/./ui/js/components/App';

const router = express.Router();
const templateString = fs.readFileSync('./dist/./ui/index-iso.html', 'utf-8');

router.get('/*', (req, res) => {
  const context = {};

  const app = React.createElement(App, null, null);
  const root = React.createElement(StaticRouter, { location: req.url, context }, app);
  const content = ReactDOMServer.renderToString(root);

  if (context.url) {
    res.writeHead(301, { Location: context.url });
    res.end();
  } else {
    const markup = ejs.render(templateString, { content });
    res.write(markup);
    res.end();
  }
});

module.exports = router;
