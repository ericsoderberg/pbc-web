require("../scss/index.scss");
require("leaflet/dist/leaflet.css");

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';
import routes from './routes';
import { initialize } from './actions';

initialize();

const main = (
  <Router history={browserHistory} routes={routes}
    onUpdate={() => document.body.scrollTop = 0} />
);

const element = document.getElementById('content');

ReactDOM.render(main, element);

document.body.classList.remove('loading');
