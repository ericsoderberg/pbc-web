"use strict";
import Edit from '../../components/Edit';
import PageFormContents from './PageFormContents';
import PagePreview from './PagePreview';

export default class PageEdit extends Edit {};

PageEdit.defaultProps = {
  category: 'pages',
  FormContents: PageFormContents,
  Preview: PagePreview,
  title: 'Edit Page'
};
