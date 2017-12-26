import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
// import moment from 'moment-timezone';
import List from '../../components/List';
import EventItem from './EventItem';

export default class Events extends List {}

Events.defaultProps = {
  ...List.defaultProps,
  category: 'events',
  Item: EventItem,
  // marker: {
  //   property: 'start',
  //   value: (new Date()).toISOString(),
  //   label: (
  //     <div className="marker">
  //       <span>Today</span><span>{moment().format('MMM Do YYYY')}</span>
  //     </div>
  //   ),
  // },
  path: '/events',
  sort: '-modified',
  title: 'Events',
};
