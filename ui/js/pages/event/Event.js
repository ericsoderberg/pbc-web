"use strict";
import React from 'react';
import Show from '../../components/Show';

const EventContents = (props) => {
  return (
    <div>TBD</div>
  );
};

export default class Event extends Show {};

Event.defaultProps = {
  category: 'events',
  Contents: EventContents
};
