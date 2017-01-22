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

export default (router, options) => {
  const { category, modelName } = options;
  const Doc = mongoose.model(modelName);
  let methods = options.methods || ['get', 'put', 'delete', 'index', 'post'];
  if (options.omit) {
    methods = methods.filter(m => ! options.omit.some(o => o === m));
  }

  if (methods.indexOf('get') >= 0) {
    const getOpts = options.get || {};
    router.get(`/${category}/:id`, (req, res) => {
      const id = req.params.id;
      const criteria = ID_REGEXP.test(id) ? {_id: id} : {path: id};
      let query = Doc.findOne(criteria);
      if (req.query.select) {
        query.select(req.query.select);
      }
      if (req.query.populate) {
        const populate = JSON.parse(req.query.populate);
        if (true === populate) {
          // populate from options
          if (getOpts.populate) {
            addPopulate(query, getOpts.populate);
          }
        } else {
          addPopulate(query, populate);
        }
      } else if (getOpts.populate) {
        addPopulate(query, getOpts.populate);
      }
      query.exec()
      .then(doc => {
        if (! doc) {
          res.status(404);
          return Promise.reject(404);
        } else {
          return doc;
        }
      })
      .then(doc => (getOpts.transformOut ?
        getOpts.transformOut(doc, req) : doc))
      .then(doc => res.json(doc))
      .catch(error => {
        res.status(typeof error === 'number' ? error : 400).json(error);
      });
    });
  }

  if (methods.indexOf('put') >= 0) {
    const putOpts = options.put || {};
    router.put(`/${category}/:id`, (req, res) => {
      const id = req.params.id;
      authorize(req, res)
      .then(session => {
        let data = req.body;
        data.modified = new Date();
        data.userId = session.userId;
        return data;
      })
      .then(data => (putOpts.transformIn ?
        putOpts.transformIn(data, req) : data))
      .then(data => Doc.findOneAndUpdate({ _id: id }, data,
        { new: true }).exec())
      .then(doc => (putOpts.transformOut ?
        putOpts.transformOut(doc, req) : doc))
      .then(doc => res.status(200).json(doc))
      .catch(error => {
        console.log('!!!', error);
        res.status(400).json(error);
      });
    });
  }

  if (methods.indexOf('delete') >= 0) {
    const deleteOpts = options.delete || {};
    router.delete(`/${category}/:id`, (req, res) => {
      const id = req.params.id;
      authorize(req, res)
      .then(session => Doc.findById(id).exec())
      .then(doc => doc.remove())
      .then(doc => (deleteOpts.deleteRelated ?
        deleteOpts.deleteRelated(doc, req) : doc))
      .then(() => res.status(200).send())
      .catch(error => res.status(400).json(error));
    });
  }

  if (methods.indexOf('index') >= 0) {
    const indexOpts = options.index || {};
    router.get(`/${category}`, (req, res) => {
      authorize(req, res, false)
      .then(session => {
        const searchProperties = indexOpts.searchProperties || 'name';
        let query = Doc.find();
        if (indexOpts.authorize) {
          query.find(indexOpts.authorize(session));
        }
        if (req.query.search) {
          if (indexOpts.textSearch) {
            // This isn't working :(
            query.find(
              { $text: { $search: req.query.search } },
              { score: { $meta: "textScore" } }
            );
            query.sort({ score: { $meta: "textScore" }, modified: -1 });
          } else {
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
        if (req.query.sort && (! indexOpts.textSearch || ! req.query.search) ) {
          query.sort(req.query.sort);
        }
        if (req.query.select) {
          query.select(req.query.select);
        }
        if (req.query.populate) {
          const populate = JSON.parse(req.query.populate);
          if (true === populate) {
            // populate from options
            if (indexOpts.populate) {
              addPopulate(query, indexOpts.populate);
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
        .then(docs => (indexOpts.transformOut ?
          indexOpts.transformOut(docs, req) : docs))
        .then(docs => res.json(docs))
        .catch(error => res.status(400).json(error));
      });
    });
  }

  if (methods.indexOf('post') >= 0) {
    const postOpts = options.post || {};
    router.post(`/${category}`, (req, res) => {
      authorize(req, res)
      .then(session => {
        let data = req.body;
        data.created = new Date();
        data.modified = data.created;
        data.userId = session.userId;
        return data;
      })
      .then(data => (postOpts.transformIn ?
        postOpts.transformIn(data, req) : data))
      .then(data => (new Doc(data)).save())
      .then(doc => (postOpts.transformOut ?
        postOpts.transformOut(doc, req) : doc))
      .then(doc => res.status(200).json(doc))
      .catch(error => {
        console.log(error);
        res.status(400).json(error);
      });
    });
  }
};
