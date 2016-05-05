require("../scss/index.scss");

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';
import routes from './routes';

const main = (
  <Router history={browserHistory} routes={routes} />
);

const element = document.getElementById('content');

ReactDOM.render(main, element);

document.body.classList.remove('loading');
