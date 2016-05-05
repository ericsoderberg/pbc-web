"use strict";

// Partial reference
// http://madx.me/articles/a-simpler-alternative-to-flux-and-redux.html

let _state = {};
let _listeners = [];
let _index = 1;

export function getState () {
  return _state;
};

export function dispatch (action, ...args) {
  const oldState = _state;
  _state = action(_state, ...args);
  if (_state !== oldState) {
    _listeners.forEach(listener => listener.handler(_state, oldState));
  }
};

export function subscribe (handler) {
  const listener = { index: _index, handler: handler };
  _index += 1;
  _listeners.push(listener);
  return function unsubscribe() {
    if (subscribers.has(subscriber)) {
      _listeners = _listeners.filter(l => (l.index !== listener.index));
    }
  };
}

export function unsubscribe (index) {
  _listeners = _listeners.filter(listener => (listener.index !== index));
}
