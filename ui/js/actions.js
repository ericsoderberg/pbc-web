"use strict";
import { dispatch } from './store';

let _headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};
let _sessionId;

const processStatus = (response) => {
  if (response.ok) {
    return Promise.resolve(response);
  } else {
    return response.json().then(json => Promise.reject(json || response.statusText));
  }
};

// Session
export function haveSession () {
  return _sessionId ? true : false;
}

export function setSession (session) {
  _sessionId = session._id;
  _headers.Authorization = `Token token=${session.token}`;
  dispatch(state => ({ ...state, session: session }));
  localStorage.session = JSON.stringify(session);
  return session;
};

export function clearSession (object) {
  _sessionId = undefined;
  delete _headers.Authorization;
  dispatch(state => ({ session: undefined }));
  localStorage.removeItem('session');
  return object;
};

export function initialize () {
  if (localStorage.session) {
    const session = JSON.parse(localStorage.session);
    setSession(session);
  }
}

export function postSession (session) {
  return fetch('/api/sessions', {
    method: 'POST', headers: _headers, body: JSON.stringify(session) })
  .then(processStatus)
  .then(response => response.json())
  .then(setSession);
}

export function postSessionViaToken (session) {
  return fetch('/api/sessions/token', {
    method: 'POST', headers: _headers, body: JSON.stringify(session) })
  .then(processStatus)
  .then(response => response.json())
  .then(setSession);
}

export function deleteSession () {
  return fetch(`/api/sessions/${_sessionId}`, {
    method: 'DELETE', headers: _headers })
  .then(processStatus)
  .then(clearSession)
  .catch(clearSession);
}

// Generic

function cacheAdd (category, item) {
  dispatch(state => {
    let cache = { ...(state[category] || {}) };
    cache[item.path || item._id] = item;
    const nextState = { ...state };
    nextState[category] = cache;
    return nextState;
  });
}

function cacheRemove (category, item) {
  dispatch(state => {
    let cache = { ...(state[category] || {}) };
    delete cache[item.path];
    delete cache[item._id];
    const nextState = { ...state };
    nextState[category] = cache;
    return nextState;
  });
}

export function getItems (category, options={}) {
  const params = [];
  if (options.search) {
    params.push(`search=${encodeURIComponent(options.search)}`);
  }
  if (options.filter) {
    params.push(`filter=${encodeURIComponent(JSON.stringify(options.filter))}`);
  }
  if (options.sort) {
    params.push(`sort=${encodeURIComponent(options.sort)}`);
  }
  if (options.select) {
    params.push(`select=${encodeURIComponent(options.select)}`);
  }
  if (options.distinct) {
    params.push(`distinct=${encodeURIComponent(options.distinct)}`);
  }
  if (options.populate) {
    params.push(`populate=${encodeURIComponent(JSON.stringify(options.populate))}`);
  }
  if (options.limit) {
    params.push(`limit=${encodeURIComponent(options.limit)}`);
  }
  if (options.skip) {
    params.push(`skip=${encodeURIComponent(options.skip)}`);
  }
  const q = params.length > 0 ? `?${params.join('&')}`: '';
  return fetch(`/api/${category}${q}`, {
    method: 'GET', headers: _headers })
  .then(processStatus)
  .then(response => response.json());
}

export function postItem (category, item) {
  return fetch(`/api/${category}`, {
    method: 'POST', headers: _headers, body: JSON.stringify(item) })
  .then(processStatus)
  .then(response => response.json());
}

export function getItem (category, id, options={}) {
  const params = [];
  if (options.select) {
    params.push(`select=${encodeURIComponent(options.select)}`);
  }
  if (options.populate) {
    params.push(`populate=${encodeURIComponent(JSON.stringify(options.populate))}`);
  }
  const q = params.length > 0 ? `?${params.join('&')}`: '';
  return fetch(`/api/${category}/${encodeURIComponent(id)}${q}`, {
    method: 'GET', headers: _headers })
  .then(processStatus)
  .then(response => response.json())
  .then(item => {
    if (options.cache) {
      cacheAdd(category, item);
    }
    return item;
  });
}

export function putItem (category, item) {
  return fetch(`/api/${category}/${encodeURIComponent(item._id)}`, {
    method: 'PUT', headers: _headers, body: JSON.stringify(item) })
  .then(processStatus)
  .then(response => response.json())
  .then(item => {
    cacheRemove(category, item);
    return item;
  });
}

export function deleteItem (category, id) {
  return fetch(`/api/${category}/${encodeURIComponent(id)}`, {
    method: 'DELETE', headers: _headers })
  .then(processStatus)
  .then(response => {
    cacheRemove(category, { _id: id });
    return response;
  });
}

// Page

// export function getPage (id) {
//   return getItem('pages', id, {
//     populate: [
//       { path: 'sections.pages.id', select: 'name path' }
//     ]
//   });
// }

// export function putPage (page) {
//   return putItem ('pages', page)
//   .then(page => {
//     dispatch(state => {
//       let pages = state.pages || {};
//       pages[page.path || page._id] = page;
//       return { ...state, pages: pages };
//     });
//     return page;
//   });
// }

// User

export function postSignUp (user) {
  return fetch('/api/users/sign-up', {
    method: 'POST', headers: _headers, body: JSON.stringify(user) })
  .then(processStatus)
  .then(response => response.json());
}

export function postVerifyEmail (email) {
  return fetch('/api/users/verify-email', {
    method: 'POST', headers: _headers, body: JSON.stringify({ email: email }) })
  .then(processStatus)
  .then(response => response.json());
}

// Site

export function getSite () {
  return fetch('/api/site', { method: 'GET', headers: _headers })
  .then(response => response.json())
  .then(site => {
    dispatch(state => ({ ...state, site: site }));
    return site;
  });;
}

export function postSite (site) {
  return fetch('/api/site', {
    method: 'POST', headers: _headers, body: JSON.stringify(site) })
  .then(processStatus)
  .then(response => response.json());
}

// Messages

// export function getMessage (id) {
//   return getItem('messages', id, { populate: true })
//   .then(message => {
//     dispatch(state => {
//       let messages = state.messages || {};
//       messages[message.path || message._id] = message;
//       return { ...state, messages: messages };
//     });
//     return message;
//   });
// }

// export function putMessage (message) {
//   return putItem ('messages', message)
//   .then(message => {
//     dispatch(state => {
//       let messages = state.messages || {};
//       messages[message.path || message._id] = message;
//       return { ...state, messages: messages };
//     });
//     return message;
//   });
// }

// Calendar

export function getCalendar (options={}) {
  let params = [];
  if (options.searchText) {
    params.push(`search=${encodeURIComponent(options.searchText)}`);
  }
  if (options.date) {
    params.push(`date=${encodeURIComponent(options.date.toISOString())}`);
  }
  if (options.filter) {
    params.push(`filter=${encodeURIComponent(JSON.stringify(options.filter))}`);
  }
  const q = params.length > 0 ? `?${params.join('&')}` : '';
  return fetch(`/api/calendar${q}`, {
    method: 'GET', headers: _headers })
  .then(response => response.json());
}

// Events

export function getResources (event) {
  return fetch('/api/events/resources', {
    method: 'POST', headers: _headers, body: JSON.stringify(event) })
  .then(response => response.json());
}

export function getUnavailableDates (event) {
  return fetch('/api/events/unavailable-dates', {
    method: 'POST', headers: _headers, body: JSON.stringify(event) })
  .then(response => response.json());
}

// Newsletter

export function postNewsletterRender (newsletter) {
  return fetch('/api/newsletters/render', {
    method: 'POST', headers: _headers, body: JSON.stringify(newsletter) })
  .then(processStatus)
  .then(response => response.text());;
}

// Map

export function getGeocode (address) {
  const query = `?q=${encodeURIComponent(address)}&format=json`;
  return fetch(`http://nominatim.openstreetmap.org/search${query}`, {
    method: 'GET', headers: { ..._headers, Authorization: undefined }})
  .then(response => response.json());
}

// Files

export function postFile (data) {
  let headers = {..._headers};
  delete headers['Content-Type'];
  return fetch('/api/files', { method: 'POST', headers: headers, body: data })
  .then(processStatus)
  .then(response => response.json());
}

export function deleteFile (id) {
  return fetch(`/api/files/${id}`, {
    method: 'DELETE', headers: _headers })
  .then(processStatus);
}

// Email lists

export function postSubscribe (emailList, addresses) {
  return fetch(`/api/email-lists/${emailList._id}/subscribe`, {
    method: 'POST', headers: _headers, body: JSON.stringify(addresses) })
  .then(processStatus);
}

export function postUnsubscribe (emailList, addresses) {
  return fetch(`/api/email-lists/${emailList._id}/unsubscribe`, {
    method: 'POST', headers: _headers, body: JSON.stringify(addresses) })
  .then(processStatus);
}

// Search

export function getSearch (searchText) {
  let params = [];
  params.push(`search=${encodeURIComponent(searchText)}`);
  const q = params.length > 0 ? `?${params.join('&')}` : '';
  return fetch(`/api/search${q}`, {
    method: 'GET', headers: _headers })
  .then(response => response.json());
}
