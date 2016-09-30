"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import '../db';
import { loadCategoryArray } from './utils';

// Event + Resource

function normalizeResource (item) {
  item.oldId = item.id;
  item.created = item.created_at || undefined;
  item.modified = item.updated_at || undefined;
  return item;
}

function normalizeEvent (item, slaveEvents, reservations) {
  item.oldId = item.id;
  item.created = item.created_at;
  item.modified = item.updated_at;
  item.text = item.notes;
  item.start = item.start_at;
  item.end = item.stop_at;
  item.dates = (slaveEvents[item.id] || []).map(item2 => item2.start_at);
  item.resourceIds = (reservations[item.id] || []);
  return item;
}

function saved (doc, results) {
  results.saved += 1;
  return doc;
}

function skipped (doc, results) {
  results.skipped += 1;
  return doc;
}

function errored (error, context, results) {
  console.log('!!! error', context, error);
  results.errors += 1;
}

export default function () {
  const Event = mongoose.model('Event');
  const Resource = mongoose.model('Resource');
  let prePromises = [];
  let results = {
    events: { saved: 0, skipped: 0, errors: 0 },
    resources: { saved: 0, skipped: 0, errors: 0 }
  };

  let resources = {}; // oldId => doc
  loadCategoryArray('resources').forEach(item => {
    const promise = Resource.findOne({ oldId: item.id }).exec()
    .then(resource => {
      if (resource) {
        return skipped(resource, results.resources);
      } else {
        item = normalizeResource(item);
        resource = new Resource(item);
        return resource.save()
        .then(resource => {
          resources[item.id] = resource;
          return saved(resource, results.resources);
        })
        .catch(error => errored(error, results.resources));
      }
    })
    .then(resource => resources[item.id] = resource);
    prePromises.push(promise);
  });

  const eventsData = loadCategoryArray('events');
  // organize non-master events by master id
  const slaveEvents = {};
  eventsData.filter(item => item.master_id && item.master_id !== item.id)
  .forEach(item => {
    if (! slaveEvents[item.master_id]) {
      slaveEvents[item.master_id] = [];
    }
    slaveEvents[item.master_id].push(item);
  });

  let reservations = {};
  return Promise.all(prePromises)
  .then(() => {
    loadCategoryArray('reservations').forEach(item => {
      if (! reservations[item.event_id]) {
        reservations[item.event_id] = [];
      }
      reservations[item.event_id].push(resources[item.resource_id]._id);
    });
  })
  .then(() => {
    const promises = [];
    eventsData.filter(item => ! item.master_id || item.master_id === item.id)
    .forEach(item => {
      const promise = Event.findOne({ oldId: item.id }).exec()
      .then(event => {
        if (event) {
          return skipped(event, results.events);
        } else {
          item = normalizeEvent(item, slaveEvents, reservations);
          event = new Event(item);
          return event.save()
          .then(event => saved(event, results.events))
          .catch(error => errored(error, results.events));
        }
      });
      promises.push(promise);
    });
    return Promise.all(promises);
  })
  .then(() => console.log('!!! Event', results))
  .catch(error => console.log('!!! Event catch', error));
}
