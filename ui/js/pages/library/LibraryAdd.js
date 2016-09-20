"use strict";
import Add from '../../components/Add';
import LibraryFormContents from './LibraryFormContents';

export default class LibraryAdd extends Add {};

LibraryAdd.defaultProps = {
  category: 'libraries',
  FormContents: LibraryFormContents,
  title: 'Add Library'
};
