import express from 'express';
import ejs from 'ejs';
import fs from 'fs';
import mongoose from 'mongoose';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import reducers from '../dist/./ui/js/reducers';
import { SITE_LOAD, ITEM_LOAD } from '../dist/./ui/js/actions';
import { pagePopulations, populatePage } from './api/pages';
import App from '../dist/./ui/js/components/App';

mongoose.Promise = global.Promise;

const router = express.Router();
const templateString = fs.readFileSync('./dist/./ui/index-iso.html', 'utf-8');

router.get('/*', (req, res, next) => {
  const context = {};
  const store = createStore(reducers, applyMiddleware(reduxThunk));

  // load site
  const Site = mongoose.model('Site');
  Site.findOne({})
    .populate({ path: 'homePageId', select: 'name' })
    .exec()
    .then((site) => {
      store.dispatch({ type: SITE_LOAD, payload: site });
      return site;
    })
    .then((site) => {
      // figure out what we are loading
      if (req.path === '/') {
        const id = site.homePageId._id;
        const Page = mongoose.model('Page');
        const query = Page.findOne({ _id: id });
        pagePopulations.forEach(p => query.populate(p));
        return query.exec()
          .then(page => populatePage(page, false))
          .then((page) => {
            store.dispatch({
              type: ITEM_LOAD, payload: { category: 'pages', id, item: page } });
          });
      }
      return Promise.reject(`No isomorphic for ${req.path}`);
    })
    .then(() => {
      const app = React.createElement(App, null, null);
      const provider = React.createElement(Provider, { store }, app);
      const root = React.createElement(StaticRouter, { location: req.url, context }, provider);
      const content = ReactDOMServer.renderToString(root);
      const preloadedState =
        JSON.stringify(store.getState()).replace(/</g, '\\u003c');

      if (context.url) {
        res.writeHead(301, { Location: context.url });
        res.end();
      } else {
        const markup = ejs.render(templateString, { content, preloadedState });
        res.write(markup);
        res.end();
      }
    })
    .catch((error) => {
      console.warn(error);
      next();
    });
});

module.exports = router;
