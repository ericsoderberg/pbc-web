// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { findDOMNode } from 'react-dom';

// Allow callers to use key labels instead of key code numbers.
// This makes their code easier to read.
const KEYS = {
  backspace: 8,
  tab: 9,
  enter: 13,
  esc: 27,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  comma: 188,
  shift: 16,
};

const _keyboardAccelerators = {};
const _listeners = [];
let _isKeyboardAcceleratorListening = false;

const _onKeyboardAcceleratorKeyPress = (e) => {
  const key = (e.keyCode ? e.keyCode : e.which);
  _listeners.slice().reverse().some((listener) => {
    if (_keyboardAccelerators[listener]) {
      const handlers = _keyboardAccelerators[listener].handlers;
      if (handlers[key]) {
        if (handlers[key](e)) {
          return true;
        }
      }
    }
    return false;
  });
};

// KeyboardAccelerators is a utility for handling keyboard events.
// Add listeners using startListeningToKeyboard().
// Remove listeners using stopListeningToKeyboard().
export default {
  _initKeyboardAccelerators(element) {
    const id = element.getAttribute('data-reactid');
    _keyboardAccelerators[id] = {
      handlers: {},
    };
  },

  _getKeyboardAcceleratorHandlers(element) {
    const id = element.getAttribute('data-reactid');
    return _keyboardAccelerators[id].handlers;
  },

  _getDowns(element) {
    const id = element.getAttribute('data-reactid');
    return _keyboardAccelerators[id].downs;
  },

  _isComponentListening(element) {
    const id = element.getAttribute('data-reactid');

    return _listeners.some(listener => listener === id);
  },

  _subscribeComponent(element) {
    const id = element.getAttribute('data-reactid');
    _listeners.push(id);
  },

  _unsubscribeComponent(element) {
    const id = element.getAttribute('data-reactid');

    const removeListenerIndex = _listeners.indexOf(id);
    _listeners.splice(removeListenerIndex, 1);

    delete _keyboardAccelerators[id];
  },

  // Add handlers for specific keys.
  // This function can be called multiple times, existing handlers will
  // be replaced, new handlers will be added.
  startListeningToKeyboard(component, handlers) {
    const element = findDOMNode(component);
    this._initKeyboardAccelerators(element);
    let keys = 0;
    Object.keys(handlers).forEach((key) => {
      if (handlers[key]) {
        const keyCode = KEYS[key] || key;
        keys += 1;
        this._getKeyboardAcceleratorHandlers(element)[keyCode] = handlers[key];
      }
    });

    if (keys > 0) {
      if (!_isKeyboardAcceleratorListening) {
        window.addEventListener('keydown', _onKeyboardAcceleratorKeyPress);
        _isKeyboardAcceleratorListening = true;
      }
      if (!this._isComponentListening(element)) {
        this._subscribeComponent(element);
      }
    }
  },

  // Remove handlers for all keys or specific keys.
  // If no argument is passed in, all handlers are removed.
  // This function can be called multiple times, only the handlers
  // specified will be removed.
  stopListeningToKeyboard(component, handlers) {
    const element = findDOMNode(component);
    if (!this._isComponentListening(element)) {
      return;
    }
    if (handlers) {
      Object.keys(handlers).forEach((key) => {
        if (handlers[key]) {
          const keyCode = KEYS[key] || key;
          delete this._getKeyboardAcceleratorHandlers(element)[keyCode];
        }
      });
    }

    let keyCount = 0;
    Object.keys(this._getKeyboardAcceleratorHandlers(element))
    .forEach((keyHandler) => {
      if (this._getKeyboardAcceleratorHandlers(element)[keyHandler]) {
        keyCount += 1;
      }
    });

    if (!handlers || keyCount === 0) {
      this._initKeyboardAccelerators(element);
      this._unsubscribeComponent(element);
    }

    if (_listeners.length === 0) {
      window.removeEventListener('keydown', _onKeyboardAcceleratorKeyPress);
      _isKeyboardAcceleratorListening = false;
    }
  },
};
