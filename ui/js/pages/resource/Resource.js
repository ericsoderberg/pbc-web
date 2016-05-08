"use strict";
import React from 'react';
import Show from '../../components/Show';

export default class Resource extends Show {
  _renderContents (user) {
    return (
      <div>
      </div>
    );
  }
};

Resource.defaultProps = {
  category: 'resources'
};
