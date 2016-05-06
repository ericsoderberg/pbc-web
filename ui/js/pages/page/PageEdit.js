"use strict";
import Edit from '../../components/Edit';
import PageForm from './PageForm';

export default class PageEdit extends Edit {};

PageEdit.defaultProps = {
  category: 'pages',
  Form: PageForm,
  title: 'Edit Page'
};
