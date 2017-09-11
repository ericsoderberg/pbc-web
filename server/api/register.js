import mongoose from 'mongoose';
import moment from 'moment-timezone';
import { getSession, requireAdministrator, authorizedForDomainOrSelf } from './auth';
import { catcher } from './utils';

mongoose.Promise = global.Promise;

export const ID_REGEXP = /^[0-9a-fA-F]{24}$/;

// Generic

export function addPopulate(query, populate) {
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
    methods = methods.filter(m => !options.omit.some(o => o === m));
  }

  if (methods.indexOf('get') >= 0) {
    const getOpts = options.get || {};
    router.get(`/${category}/:id`, (req, res) => {
      getSession(req)
        .then(getOpts.authorization || options.authorization || requireAdministrator)
        .then((session) => {
          const id = req.params.id;
          let criteria;
          if (ID_REGEXP.test(id)) {
            criteria = { _id: id };
          } else if (getOpts.pathAlias) {
            criteria = { $or: [{ path: id }, { pathAlias: id }] };
          } else {
            criteria = { path: id };
          }
          const query = Doc.findOne(criteria);
          if (req.query.select) {
            query.select(req.query.select);
          }
          if (req.query.populate) {
            const populate = JSON.parse(req.query.populate);
            if (populate === true) {
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
          return query.exec()
            .then((doc) => {
              if (!doc) {
                res.status(404);
                return Promise.reject({ status: 404 });
              }
              return doc;
            })
            .then(doc => (getOpts.transformOut ?
              getOpts.transformOut(doc, req, session) : doc));
        })
        .then((doc) => {
          if (doc.modified) {
            res.setHeader('Last-Modified',
              moment.utc(doc.modified).format('ddd, DD MMM YYYY HH:mm:ss [GMT]'));
            res.setHeader('Cache-Control', 'max-age=0, must-revalidate');
          }
          res.json(doc);
        })
        .catch(error => catcher(error, res));
    });
  }

  if (methods.indexOf('put') >= 0) {
    const putOpts = options.put || {};
    router.put(`/${category}/:id`, (req, res) => {
      const id = req.params.id;
      getSession(req)
        .then(putOpts.authorization || options.authorization || requireAdministrator)
        .then((session) => {
          const data = req.body;
          data.modified = moment.utc();
          data.userId = session.userId;
          return data;
        })
        .then(data => (putOpts.transformIn ?
          putOpts.transformIn(data, req) : data))
        .then(data => (putOpts.validate ?
          putOpts.validate(data, req) : data))
        .then(data => Doc.findOneAndUpdate({ _id: id }, data,
          { new: true, runValidators: true }).exec())
        .then(doc => (putOpts.transformOut ?
          putOpts.transformOut(doc, req) : doc))
        .then(doc => res.status(200).json(doc))
        .catch(error => catcher(error, res));
    });
  }

  if (methods.indexOf('delete') >= 0) {
    const deleteOpts = options.delete || {};
    router.delete(`/${category}/:id`, (req, res) => {
      const id = req.params.id;
      getSession(req)
        .then(deleteOpts.authorization || options.authorization || requireAdministrator)
        .then(() => Doc.findById(id).exec())
        .then(doc => doc.remove())
        .then(doc => (deleteOpts.deleteRelated ?
          deleteOpts.deleteRelated(doc, req) : doc))
        .then(() => res.status(200).send())
        .catch(error => catcher(error, res));
    });
  }

  if (methods.indexOf('index') >= 0) {
    const indexOpts = options.index || {};
    router.get(`/${category}`, (req, res) => {
      getSession(req)
        .then(indexOpts.authorization || options.authorization || requireAdministrator)
        .then((session) => {
          const searchProperties = indexOpts.searchProperties || 'name';
          const query = Doc.find();
          if (req.query.adminable) {
            query.find(authorizedForDomainOrSelf(session));
          } else if (indexOpts.filterAuthorized) {
            query.find(indexOpts.filterAuthorized(session));
          }
          if (req.query.search) {
            if (indexOpts.textSearch) {
              query.find({ $text: { $search: req.query.search } });
              query.select({ score: { $meta: 'textScore' } });
              query.sort({ score: { $meta: 'textScore' }, modified: -1 });
            } else {
              const exp = new RegExp(req.query.search, 'i');
              if (Array.isArray(searchProperties)) {
                query.or(searchProperties.map((property) => {
                  const obj = {};
                  obj[property] = exp;
                  return obj;
                }));
              } else {
                const obj = {};
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
            if (filter.created && Array.isArray(filter.created)) {
              filter.created = {
                $gte: new Date(filter.created[0]),
                $lte: new Date(filter.created[1]),
              };
            }
            query.find(filter);
          }
          if (req.query.sort && (!indexOpts.textSearch || !req.query.search)) {
            query.sort(req.query.sort);
          }
          if (req.query.select) {
            query.select(req.query.select);
          }
          if (req.query.populate) {
            const populate = JSON.parse(req.query.populate);
            if (populate === true) {
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
          return query.exec();
        })
        .then(docs => (indexOpts.transformOut ?
          indexOpts.transformOut(docs, req) : docs))
        .then((docs) => {
          res.setHeader('Cache-Control', 'max-age=0');
          res.json(docs);
        })
        .catch(error => catcher(error, res));
    });
  }

  if (methods.indexOf('post') >= 0) {
    const postOpts = options.post || {};
    router.post(`/${category}`, (req, res) => {
      getSession(req)
        .then(postOpts.authorization || options.authorization || requireAdministrator)
        .then((session) => {
          const data = req.body;
          data.created = moment.utc();
          data.modified = data.created;
          data.userId = session.userId;
          return data;
        })
        .then(data => (postOpts.transformIn ?
          postOpts.transformIn(data, req) : data))
        .then(data => (postOpts.validate ?
          postOpts.validate(data, req) : data))
        .then(data => (new Doc(data)).save())
        .then(doc => (postOpts.transformOut ?
          postOpts.transformOut(doc, req) : doc))
        .then(doc => res.status(200).json(doc))
        .catch(error => catcher(error, res));
    });
  }
};
