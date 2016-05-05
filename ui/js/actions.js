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

export function postSession (session) {
  return fetch('/api/sessions', {
    method: 'POST', headers: _headers, body: JSON.stringify(session) })
  .then(processStatus)
  .then(response => response.json())
  .then(response => {
    _sessionId = response._id;
    _headers.Authorization = `Token token=${response.token}`;
    dispatch(state => ({ session: response }));
    return response;
  });
}

export function deleteSession () {
  return fetch(`/api/sessions/${_sessionId}`, {
    method: 'DELETE', headers: _headers })
  .then(processStatus)
  .then(response => {
    _sessionId = undefined;
    delete _headers.Authorization;
    dispatch(state => ({ session: undefined }));
    return response;
  });
}

// User

export function getUsers (searchText) {
  const q = searchText ? `?q=${encodeURIComponent(searchText)}` : '';
  return fetch(`/api/users${q}`, {
    method: 'GET', headers: _headers })
  .then(response => response.json());
}

export function postUser (user) {
  return fetch('/api/users', {
    method: 'POST', headers: _headers, body: JSON.stringify(user) })
  .then(processStatus)
  .then(response => response.json());
}

export function getUser (id) {
  return fetch(`/api/users/${encodeURIComponent(id)}`, {
    method: 'GET', headers: _headers })
  .then(response => response.json());
}

export function putUser (user) {
  return fetch(`/api/users/${encodeURIComponent(user._id)}`, {
    method: 'PUT', headers: _headers, body: JSON.stringify(user) })
  .then(processStatus)
  .then(response => response.json());
}

export function deleteUser (id) {
  return fetch(`/api/users/${encodeURIComponent(id)}`, {
    method: 'DELETE', headers: _headers })
  .then(processStatus);
}
