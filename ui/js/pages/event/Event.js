"use strict";
import React from 'react';
import Show from '../../components/Show';

export default class Event extends Show {
  _renderContents (user) {
    return (
      <div>
      </div>
    );
  }
};

Event.defaultProps = {
  category: 'events'
};
