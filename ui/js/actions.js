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

const setSession = (session) => {
  _sessionId = session._id;
  _headers.Authorization = `Token token=${session.token}`;
  dispatch(state => ({ session: session }));
  localStorage.sessionToken = session.token;
  localStorage.sessionName = session.name;
  localStorage.sessionId = session._id;
  return session;
};

const clearSession = (object) => {
  _sessionId = undefined;
  delete _headers.Authorization;
  dispatch(state => ({ session: undefined }));
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('sessionName');
  localStorage.removeItem('sessionId');
  return object;
};

// Session

export function initialize () {
  if (localStorage.sessionToken) {
    setSession({
      _id: localStorage.sessionId,
      name: localStorage.sessionName,
      token: localStorage.sessionToken
    });
  }
}

export function postSession (session) {
  return fetch('/api/sessions', {
    method: 'POST', headers: _headers, body: JSON.stringify(session) })
  .then(processStatus)
  .then(response => response.json())
  .then(setSession);
}

export function deleteSession () {
  return fetch(`/api/sessions/${_sessionId}`, {
    method: 'DELETE', headers: _headers })
  .then(processStatus)
  .then(clearSession);
}

// Generic

export function getItems (category, searchText) {
  const q = searchText ? `?q=${encodeURIComponent(searchText)}` : '';
  return fetch(`/api/${category}${q}`, {
    method: 'GET', headers: _headers })
  .then(response => response.json());
}

export function postItem (category, item) {
  return fetch(`/api/${category}`, {
    method: 'POST', headers: _headers, body: JSON.stringify(item) })
  .then(processStatus)
  .then(response => response.json());
}

export function getItem (category, id) {
  return fetch(`/api/${category}/${encodeURIComponent(id)}`, {
    method: 'GET', headers: _headers })
  .then(response => response.json());
}

export function putItem (category, item) {
  return fetch(`/api/${category}/${encodeURIComponent(item._id)}`, {
    method: 'PUT', headers: _headers, body: JSON.stringify(item) })
  .then(processStatus)
  .then(response => response.json());
}

export function deleteItem (category, id) {
  return fetch(`/api/${category}/${encodeURIComponent(id)}`, {
    method: 'DELETE', headers: _headers })
  .then(processStatus);
}

// User

export function postSignUp (user) {
  return fetch('/api/users/sign-up', {
    method: 'POST', headers: _headers, body: JSON.stringify(user) })
  .then(processStatus)
  .then(response => response.json());
}

// export function getUsers (searchText) {
//   const q = searchText ? `?q=${encodeURIComponent(searchText)}` : '';
//   return fetch(`/api/users${q}`, {
//     method: 'GET', headers: _headers })
//   .then(response => response.json());
// }
//
// export function postUser (user) {
//   return fetch('/api/users', {
//     method: 'POST', headers: _headers, body: JSON.stringify(user) })
//   .then(processStatus)
//   .then(response => response.json());
// }
//
// export function getUser (id) {
//   return fetch(`/api/users/${encodeURIComponent(id)}`, {
//     method: 'GET', headers: _headers })
//   .then(response => response.json());
// }
//
// export function putUser (user) {
//   return fetch(`/api/users/${encodeURIComponent(user._id)}`, {
//     method: 'PUT', headers: _headers, body: JSON.stringify(user) })
//   .then(processStatus)
//   .then(response => response.json());
// }
//
// export function deleteUser (id) {
//   return fetch(`/api/users/${encodeURIComponent(id)}`, {
//     method: 'DELETE', headers: _headers })
//   .then(processStatus);
// }

// Page

// export function getPages (searchText) {
//   const q = searchText ? `?q=${encodeURIComponent(searchText)}` : '';
//   return fetch(`/api/pages${q}`, {
//     method: 'GET', headers: _headers })
//   .then(response => response.json());
// }
//
// export function postPage (page) {
//   return fetch('/api/pages', {
//     method: 'POST', headers: _headers, body: JSON.stringify(user) })
//   .then(processStatus)
//   .then(response => response.json());
// }
//
// export function getUser (id) {
//   return fetch(`/api/users/${encodeURIComponent(id)}`, {
//     method: 'GET', headers: _headers })
//   .then(response => response.json());
// }
//
// export function putUser (user) {
//   return fetch(`/api/users/${encodeURIComponent(user._id)}`, {
//     method: 'PUT', headers: _headers, body: JSON.stringify(user) })
//   .then(processStatus)
//   .then(response => response.json());
// }
//
// export function deleteUser (id) {
//   return fetch(`/api/users/${encodeURIComponent(id)}`, {
//     method: 'DELETE', headers: _headers })
//   .then(processStatus);
// }
