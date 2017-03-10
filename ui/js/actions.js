
import { dispatch } from './store';

const _headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};
let _sessionId;

const processStatus = (response) => {
  if (response.ok) {
    return Promise.resolve(response);
  }
  return response.json()
  .then(json => Promise.reject(json || response.statusText));
};

// Session
export function haveSession() {
  return _sessionId ? true : false;
}

export function setSession(session) {
  _sessionId = session._id;
  _headers.Authorization = `Token token=${session.token}`;
  dispatch(state => ({ ...state, session }));
  localStorage.session = JSON.stringify(session);
  return session;
}

export function clearSession(object) {
  _sessionId = undefined;
  delete _headers.Authorization;
  dispatch(() => ({ session: undefined }));
  localStorage.removeItem('session');
  return object;
}

export function initialize() {
  if (localStorage.session) {
    const session = JSON.parse(localStorage.session);
    setSession(session);
  }
}

export function postSession(session) {
  return fetch('/api/sessions', {
    method: 'POST', headers: _headers, body: JSON.stringify(session) })
  .then(processStatus)
  .then(response => response.json())
  .then(setSession);
}

export function postSessionViaToken(session) {
  return fetch('/api/sessions/token', {
    method: 'POST', headers: _headers, body: JSON.stringify(session) })
  .then(processStatus)
  .then(response => response.json())
  .then(setSession);
}

export function deleteSession() {
  return fetch(`/api/sessions/${_sessionId}`, {
    method: 'DELETE', headers: _headers })
  .then(processStatus)
  .then(clearSession)
  .catch(clearSession);
}

// Generic

function cacheAdd(category, item) {
  dispatch((state) => {
    const cache = { ...(state[category] || {}) };
    // also store the id -> path mapping so we can remove cached paths
    // when we only have an id
    const paths = { ...(state[`${category}-paths`] || {}) };
    cache[item._id] = item;
    if (item.path) {
      cache[item.path] = item;
      paths[item._id] = item.path;
    }
    const nextState = { ...state };
    nextState[category] = cache;
    nextState[`${category}-paths`] = paths;
    return nextState;
  });
}

function cacheRemove(category, item) {
  dispatch((state) => {
    const cache = { ...(state[category] || {}) };
    const paths = { ...(state[`${category}-paths`] || {}) };
    delete cache[item.path];
    delete cache[item._id];
    delete paths[item._id];
    const nextState = { ...state };
    nextState[category] = cache;
    nextState[`${category}-paths`] = paths;
    return nextState;
  });
}

export function getItems(category, options = {}) {
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
    params.push(
      `populate=${encodeURIComponent(JSON.stringify(options.populate))}`,
    );
  }
  if (options.limit) {
    params.push(`limit=${encodeURIComponent(options.limit)}`);
  }
  if (options.skip) {
    params.push(`skip=${encodeURIComponent(options.skip)}`);
  }
  const q = params.length > 0 ? `?${params.join('&')}` : '';
  return fetch(`/api/${category}${q}`, {
    method: 'GET', headers: _headers })
  .then(processStatus)
  .then(response => response.json());
}

export function postItem(category, item) {
  return fetch(`/api/${category}`, {
    method: 'POST', headers: _headers, body: JSON.stringify(item) })
  .then(processStatus)
  .then(response => response.json());
}

export function getItem(category, id, options = {}) {
  const params = [];
  if (options.select) {
    params.push(`select=${encodeURIComponent(options.select)}`);
  }
  if (options.populate) {
    params.push(
      `populate=${encodeURIComponent(JSON.stringify(options.populate))}`,
    );
  }
  const q = params.length > 0 ? `?${params.join('&')}` : '';
  return fetch(`/api/${category}/${encodeURIComponent(id)}${q}`, {
    method: 'GET', headers: _headers })
  .then(processStatus)
  .then(response => response.json())
  .then((item) => {
    if (options.cache) {
      cacheAdd(category, item);
    }
    return item;
  });
}

export function putItem(category, item) {
  return fetch(`/api/${category}/${encodeURIComponent(item._id)}`, {
    method: 'PUT', headers: _headers, body: JSON.stringify(item) })
  .then(processStatus)
  .then(response => response.json())
  .then((itemResponse) => {
    cacheRemove(category, itemResponse);
    return itemResponse;
  });
}

export function deleteItem(category, id) {
  return fetch(`/api/${category}/${encodeURIComponent(id)}`, {
    method: 'DELETE', headers: _headers })
  .then(processStatus)
  .then((response) => {
    cacheRemove(category, { _id: id });
    return response;
  });
}

// Page

export function getPageMap(id) {
  return fetch(`/api/pages/${id}/map`, { method: 'GET', headers: _headers })
  .then(response => response.json());
}

export function postPublicize() {
  return fetch('/api/pages/publicize', { method: 'POST', headers: _headers })
  .then(processStatus)
  .then(response => response.json());
}

// User

export function postSignUp(user) {
  return fetch('/api/users/sign-up', {
    method: 'POST', headers: _headers, body: JSON.stringify(user) })
  .then(processStatus)
  .then(response => response.json());
}

export function postVerifyEmail(email, returnPath) {
  return fetch('/api/users/verify-email', {
    method: 'POST',
    headers: _headers,
    body: JSON.stringify({ email, returnPath }),
  })
  .then(processStatus)
  .then(response => response.json());
}

// Site

export function getSite() {
  return fetch('/api/site', { method: 'GET', headers: _headers })
  .then(response => response.json())
  .then((site) => {
    dispatch(state => ({ ...state, site }));
    return site;
  });
}

export function postSite(site) {
  return fetch('/api/site', {
    method: 'POST', headers: _headers, body: JSON.stringify(site) })
  .then(processStatus)
  .then(response => response.json());
}

// Calendar

export function getCalendar(options = {}) {
  const params = [];
  if (options.searchText) {
    params.push(`search=${encodeURIComponent(options.searchText)}`);
  }
  if (options.date) {
    params.push(`date=${encodeURIComponent(options.date.toISOString())}`);
  }
  if (options.id) {
    params.push(`id=${encodeURIComponent(options.id)}`);
  }
  if (options.ids) {
    options.ids.forEach((id) => {
      params.push(`id=${encodeURIComponent(id)}`);
    });
  }
  const q = params.length > 0 ? `?${params.join('&')}` : '';
  return fetch(`/api/calendar${q}`, {
    method: 'GET', headers: _headers })
  .then(response => response.json());
}

// Events

export function getResources(event) {
  return fetch('/api/events/resources', {
    method: 'POST', headers: _headers, body: JSON.stringify(event) })
  .then(response => response.json());
}

export function getUnavailableDates(event) {
  return fetch('/api/events/unavailable-dates', {
    method: 'POST', headers: _headers, body: JSON.stringify(event) })
  .then(response => response.json());
}

// Newsletter

export function postNewsletterRender(newsletter) {
  return fetch('/api/newsletters/render', {
    method: 'POST', headers: _headers, body: JSON.stringify(newsletter) })
  .then(processStatus)
  .then(response => response.text());
}

// Map

export function getGeocode(address) {
  const query = `?q=${encodeURIComponent(address)}&format=json`;
  const url =
    `${window.location.protocol}//nominatim.openstreetmap.org/search${query}`;
  return fetch(url, {
    method: 'GET', headers: { ..._headers, Authorization: undefined } })
  .then(response => response.json());
}

// Files

export function postFile(data) {
  const headers = { ..._headers };
  delete headers['Content-Type'];
  return fetch('/api/files', { method: 'POST', headers, body: data })
  .then(processStatus)
  .then(response => response.json());
}

export function deleteFile(id) {
  return fetch(`/api/files/${id}`, {
    method: 'DELETE', headers: _headers })
  .then(processStatus);
}

// Email lists

export function postSubscribe(emailList, addresses) {
  return fetch(`/api/email-lists/${emailList._id}/subscribe`, {
    method: 'POST', headers: _headers, body: JSON.stringify(addresses) })
  .then(processStatus);
}

export function postUnsubscribe(emailList, addresses) {
  return fetch(`/api/email-lists/${emailList._id}/unsubscribe`, {
    method: 'POST', headers: _headers, body: JSON.stringify(addresses) })
  .then(processStatus);
}

// Search

export function getSearch(searchText) {
  const params = [];
  params.push(`search=${encodeURIComponent(searchText)}`);
  const q = params.length > 0 ? `?${params.join('&')}` : '';
  return fetch(`/api/search${q}`, {
    method: 'GET', headers: _headers })
  .then(processStatus)
  .then(response => response.json());
}
