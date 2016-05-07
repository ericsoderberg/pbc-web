"use strict";
import Edit from '../../components/Edit';
import PageForm from './PageForm';
import PagePreview from './PagePreview';

export default class PageEdit extends Edit {};

PageEdit.defaultProps = {
  category: 'pages',
  Form: PageForm,
  Preview: PagePreview,
  title: 'Edit Page'
};
