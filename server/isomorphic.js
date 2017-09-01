import express from 'express';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import reducers from '../dist/./ui/js/reducers';
import { SITE_LOAD, ITEM_LOAD, CATEGORY_LOAD } from '../dist/./ui/js/actions';
import { pagePopulations, populatePage } from './api/pages';
import { eventPopulations, populateEvent } from './api/events';
import { messagePopulations, populateMessage } from './api/messages';
import { ID_REGEXP } from './api/register';
import App from '../dist/./ui/js/components/App';

mongoose.Promise = global.Promise;

const router = express.Router();
const templateString =
  fs.readFileSync(path.resolve(path.join(__dirname, '/../dist/./index-iso.html')), 'utf-8');

const renderAndRespond = (req, res, context, store) => {
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
};

const loadSite = (store) => {
  const Site = mongoose.model('Site');
  return Site.findOne({})
    .populate({ path: 'homePageId', select: 'name' })
    .exec()
    .then((site) => {
      store.dispatch({ type: SITE_LOAD, payload: site });
      return site;
    });
};

// Home page
router.get('/', (req, res, next) => {
  const context = {};
  const store = createStore(reducers, applyMiddleware(reduxThunk));

  loadSite(store)
    .then((site) => {
      const id = site.homePageId._id;
      const Page = mongoose.model('Page');
      const query = Page.findOne({ _id: id });
      pagePopulations.filter(p => p.model !== 'FormTemplate')
        .forEach(p => query.populate(p));
      return query.exec()
        .then(page => populatePage(page, false))
        .then((page) => {
          store.dispatch({
            type: ITEM_LOAD, payload: { category: 'pages', id, item: page } });
        });
    })
    .then(() => renderAndRespond(req, res, context, store))
    .catch((error) => {
      console.warn(error);
      next();
    });
});

// events
router.get('/events/:id', (req, res, next) => {
  const context = {};
  const store = createStore(reducers, applyMiddleware(reduxThunk));

  loadSite(store)
    .then(() => {
      const Event = mongoose.model('Event');
      const id = req.params.id;
      const criteria = (ID_REGEXP.test(id) ? { _id: id } : { path: id });
      const query = Event.findOne(criteria);
      eventPopulations.forEach(p => query.populate(p));
      return query.exec()
        .then(event => event || Promise.reject('none'))
        .then(event => populateEvent(event, false))
        .then((event) => {
          store.dispatch({
            type: ITEM_LOAD, payload: { category: 'events', id, item: event } });
        });
    })
    .then(() => renderAndRespond(req, res, context, store))
    .catch((error) => {
      if (error !== 'none') console.warn(error);
      next();
    });
});

// libraries
router.get('/libraries/:id', (req, res, next) => {
  const context = {};
  const store = createStore(reducers, applyMiddleware(reduxThunk));

  loadSite(store)
    .then(() => {
      const Library = mongoose.model('Library');
      const id = req.params.id;
      const criteria = (ID_REGEXP.test(id) ? { _id: id } : { path: id });
      const query = Library.findOne(criteria);
      return query.exec()
        .then(library => library || Promise.reject('none'))
        .then((library) => {
          store.dispatch({
            type: ITEM_LOAD, payload: { category: 'libraries', id, item: library } });
          return library;
        });
    })
    .then((library) => {
      const Message = mongoose.model('Message');
      return Message.find({ libraryId: library._id })
        .select('name path verses date author series color')
        .sort('-date')
        .limit(20)
        .exec()
        .then((messages) => {
          store.dispatch({
            type: CATEGORY_LOAD, payload: { category: 'messages', items: messages } });
        });
    })
    .then(() => renderAndRespond(req, res, context, store))
    .catch((error) => {
      if (error !== 'none') console.warn(error);
      next();
    });
});

// messages
router.get('/messages/:id', (req, res, next) => {
  const context = {};
  const store = createStore(reducers, applyMiddleware(reduxThunk));

  loadSite(store)
    .then(() => {
      const Message = mongoose.model('Message');
      const id = req.params.id;
      const criteria = (ID_REGEXP.test(id) ? { _id: id } : { path: id });
      const query = Message.findOne(criteria);
      messagePopulations.forEach(p => query.populate(p));
      return query.exec()
        .then(message => message || Promise.reject('none'))
        .then(message => populateMessage(message))
        .then((message) => {
          store.dispatch({
            type: ITEM_LOAD, payload: { category: 'messages', id, item: message } });
        });
    })
    .then(() => renderAndRespond(req, res, context, store))
    .catch((error) => {
      if (error !== 'none') console.warn(error);
      next();
    });
});

// pages
router.get('/:id', (req, res, next) => {
  const context = {};
  const store = createStore(reducers, applyMiddleware(reduxThunk));

  loadSite(store)
    .then(() => {
      const Page = mongoose.model('Page');
      const id = req.params.id;
      const criteria = (ID_REGEXP.test(id) ? { _id: id } :
        { $or: [{ path: id }, { pathAlias: id }] });
      const query = Page.findOne(criteria);
      pagePopulations.filter(p => p.model !== 'FormTemplate')
        .forEach(p => query.populate(p));
      return query.exec()
        .then(page => page || Promise.reject('none'))
        .then(page => populatePage(page, false))
        .then((page) => {
          store.dispatch({
            type: ITEM_LOAD, payload: { category: 'pages', id, item: page } });
        });
      // return Promise.reject(`No isomorphic for ${req.path}`);
    })
    .then(() => renderAndRespond(req, res, context, store))
    .catch((error) => {
      if (error !== 'none') console.warn(error);
      next();
    });
});

module.exports = router;
