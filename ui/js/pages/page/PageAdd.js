"use strict";
import Add from '../../components/Add';
import PageForm from './PageForm';

export default class PageAdd extends Add {};

PageAdd.defaultProps = {
  category: 'pages',
  Form: PageForm,
  title: 'Add Page'
};
