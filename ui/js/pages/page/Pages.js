"use strict";
import List from '../../components/List';
import PageItem from './PageItem';

export default class Pages extends List {};

Pages.defaultProps = {
  ...List.defaultProps,
  category: 'pages',
  Item: PageItem,
  path: '/pages',
  select: 'name path',
  title: 'Pages'
};
