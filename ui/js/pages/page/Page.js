"use strict";
import React from 'react';
import Show from '../../components/Show';

export default class Page extends Show {
  _renderContents (item) {
    return;
  }
};

Page.defaultProps = {
  category: 'pages'
};
