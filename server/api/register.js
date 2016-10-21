"use strict";
import mongoose from 'mongoose';
import { authorize } from './auth';

const ID_REGEXP = /^[0-9a-fA-F]{24}$/;

// Generic

function addPopulate (query, populate) {
  if (Array.isArray(populate)) {
    populate.forEach(pop => query.populate(pop));
  } else {
    query.populate(populate);
  }
}

export default (router, category, modelName, options={}) => {
  const transformIn = options.transformIn || {};
  const transformOut = options.transformOut || {};
  let methods = options.methods || ['get', 'put', 'delete', 'index', 'post'];
  if (options.omit) {
    methods = methods.filter(m => ! options.omit.some(o => o === m));
  }

  if (methods.indexOf('get') >= 0) {
    router.get(`/${category}/:id`, (req, res) => {
      const id = req.params.id;
      const Doc = mongoose.model(modelName);
      const criteria = ID_REGEXP.test(id) ? {_id: id} : {path: id};
      let query = Doc.findOne(criteria);
      if (req.query.select) {
        query.select(req.query.select);
      }
      if (req.query.populate) {
        const populate = JSON.parse(req.query.populate);
        if (true === populate) {
          // populate from options
          if (options.populate && options.populate.get) {
            addPopulate(query, options.populate.get);
          }
        } else {
          addPopulate(query, populate);
        }
      } else if (options.populate && options.populate.get) {
        addPopulate(query, options.populate.get);
      }
      query.exec()
      .then(doc => (transformOut.get ? transformOut.get(doc, req) : doc))
      .then(doc => res.json(doc))
      .catch(error => res.status(400).json(error));
    });
  }

  if (methods.indexOf('put') >= 0) {
    router.put(`/${category}/:id`, (req, res) => {
      authorize(req, res)
      .then(session => {
        const id = req.params.id;
        const Doc = mongoose.model(modelName);
        let data = req.body;
        data.modified = new Date();
        data.userId = session.userId;
        data = (transformIn.put ? transformIn.put(data, session) : data);
        Doc.findOneAndUpdate({ _id: id }, data)
        .exec()
        .then(doc => (transformOut.put ? transformOut.put(doc, req) : doc))
        .then(doc => res.status(200).json(doc))
        .catch(error => res.status(400).json(error));
      });
    });
  }

  if (methods.indexOf('delete') >= 0) {
    router.delete(`/${category}/:id`, (req, res) => {
      authorize(req, res)
      .then(session => {
        const id = req.params.id;
        const Doc = mongoose.model(modelName);
        Doc.findById(id)
        .exec()
        .then(doc => doc.remove())
        .then(doc => (transformOut.delete ?
          transformOut.delete(doc, req) : doc))
        .then(() => res.status(200).send())
        .catch(error => res.status(400).json(error));
      });
    });
  }

  if (methods.indexOf('index') >= 0) {
    router.get(`/${category}`, (req, res) => {
      authorize(req, res, false)
      .then(session => {
        const Doc = mongoose.model(modelName);
        const searchProperties = options.searchProperties || 'name';
        let query = Doc.find();
        if (options.authorize && options.authorize.index) {
          query.find(options.authorize.index(session));
        }
        if (req.query.search) {
          const exp = new RegExp(req.query.search, 'i');
          if (Array.isArray(searchProperties)) {
            query.or(searchProperties.map(property => {
              let obj = {};
              obj[property] = exp;
              return obj;
            }));
          } else {
            let obj = {};
            obj[searchProperties] = exp;
            query.find(obj);
          }
        }
        if (req.query.filter) {
          let filter = JSON.parse(req.query.filter);
          if (typeof filter === 'string') {
            // need double de-escape,
            // first to de-string and then to de-stringify
            filter = JSON.parse(filter);
          }
          query.find(filter);
        }
        if (req.query.sort) {
          query.sort(req.query.sort);
        }
        if (req.query.select) {
          query.select(req.query.select);
        }
        if (req.query.populate) {
          const populate = JSON.parse(req.query.populate);
          if (true === populate) {
            // populate from options
            if (options.populate && options.populate.index) {
              addPopulate(query, options.populate.index);
            }
          } else {
            addPopulate(query, populate);
          }
        }
        if (req.query.distinct) {
          query.distinct(req.query.distinct);
        } else if (req.query.limit) {
          query.limit(parseInt(req.query.limit, 10));
        } else {
          query.limit(20);
        }
        if (req.query.skip) {
          query.skip(parseInt(req.query.skip, 10));
        }
        query.exec()
        .then(docs => (transformOut.index ?
          transformOut.index(docs, req) : docs))
        .then(docs => res.json(docs))
        .catch(error => res.status(400).json(error));
      });
    });
  }

  if (methods.indexOf('post') >= 0) {
    router.post(`/${category}`, (req, res) => {
      authorize(req, res)
      .then(session => {
        const Doc = mongoose.model(modelName);
        let data = req.body;
        data.created = new Date();
        data.modified = data.created;
        data.userId = session.userId;
        data = (transformIn.post ? transformIn.post(data, session) : data);
        const doc = new Doc(data);
        doc.save()
        .then(doc => (transformOut.post ? transformOut.post(doc, req) : doc))
        .then(doc => res.status(200).json(doc))
        .catch(error => res.status(400).json(error));
      });
    });
  }
};
