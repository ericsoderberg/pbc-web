"use strict";
import Show from '../../components/Show';
import PageContents from './PageContents';

export default class Page extends Show {};

Page.defaultProps = {
  category: 'pages',
  Contents: PageContents
};
