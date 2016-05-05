"use strict";
import store from './store';

const HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

// Session

export function postSession (session) {
  return fetch('/api/sessions', {
    method: 'POST', headers: HEADERS, body: JSON.stringify(session) })
    .then(response => response.json())
    .then(response => {
      store.set('sessionUser', response);
      return response;
    });
}

// User

export function getUsers (searchText) {
  const q = searchText ? `?q=${encodeURIComponent(searchText)}` : '';
  return fetch(`/api/users${q}`, {
    method: 'GET', headers: HEADERS })
    .then(response => response.json());
}

export function postUser (user) {
  return fetch('/api/users', {
    method: 'POST', headers: HEADERS, body: JSON.stringify(user) })
    .then(response => response.json());
}

export function getUser (id) {
  return fetch(`/api/users/${encodeURIComponent(id)}`, {
    method: 'GET', headers: HEADERS })
    .then(response => response.json());
}

export function putUser (user) {
  return fetch(`/api/users/${encodeURIComponent(user._id)}`, {
    method: 'PUT', headers: HEADERS, body: JSON.stringify(user) })
    .then(response => response.json());
}

export function deleteUser (id) {
  return fetch(`/api/users/${encodeURIComponent(id)}`, {
    method: 'DELETE', headers: HEADERS });
}
