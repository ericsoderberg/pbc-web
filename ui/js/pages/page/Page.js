"use strict";
import React from 'react';
import Show from '../../components/Show';
import PageContents from './PageContents';

export default class Page extends Show {
  _renderContents (item) {
    return <PageContents page={item} />;
  }
};

Page.defaultProps = {
  category: 'pages'
};
