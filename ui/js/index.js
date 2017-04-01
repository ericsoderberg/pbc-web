import React from 'react';
import ReactDOM from 'react-dom';
import { initialize } from './actions';
import App from './components/App';

require('leaflet/dist/leaflet.css');
require('../scss/index.scss');

initialize();

const main = <App />;

const element = document.getElementById('content');

ReactDOM.render(main, element);

document.body.classList.remove('loading');
