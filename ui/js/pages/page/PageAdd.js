"use strict";
import Add from '../../components/Add';
import PageFormContents from './PageFormContents';
import PagePreview from './PagePreview';

export default class PageAdd extends Add {};

PageAdd.defaultProps = {
  category: 'pages',
  FormContents: PageFormContents,
  Preview: PagePreview,
  title: 'Add Page'
};
