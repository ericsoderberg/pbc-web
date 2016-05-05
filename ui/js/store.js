"use strict";

let _state = {};
let _listeners = [];
let _index = 1;

export function get (key) {
  return _state[key];
};

export function set (key, value) {
  _state[key] = value;
  _listeners.forEach(listener => listener.handler());
};

export function subscribe (handler) {
  const index = _index;
  _index += 1;
  _listeners.push({ index: index, handler: handler });
  return _index;
}

export function unsubscribe (index) {
  _listeners = _listeners.filter(listener => (listener.index !== index));
}
