import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
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

const history = createBrowserHistory();

const store = createStore(reducers, applyMiddleware(reduxThunk)); //, reduxLogger));
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
