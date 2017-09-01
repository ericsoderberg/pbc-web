import 'whatwg-fetch';
import { polyfill as promisePolyfill } from 'es6-promise';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';
// import reduxLogger from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import reducers from './reducers';
import { initialize } from './actions';
import App from './components/App';

require('leaflet/dist/leaflet.css');
// require('../scss/index.scss');

promisePolyfill();

const history = createBrowserHistory();

// Grab the state from a global variable injected into the server-generated HTML
const preloadedState = window.__PRELOADED_STATE__;
// Allow the passed state to be garbage-collected
delete window.__PRELOADED_STATE__;

const store = createStore(reducers, preloadedState, applyMiddleware(reduxThunk));
// , reduxLogger));
store.dispatch(initialize());

const main = (
  <Router history={history}>
    <Provider store={store}>
      <App />
    </Provider>
  </Router>
);

const element = document.getElementById('content');

ReactDOM.render(main, element);

document.body.classList.remove('loading');
