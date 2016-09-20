"use strict";
import Edit from '../../components/Edit';
import LibraryFormContents from './LibraryFormContents';

export default class LibraryEdit extends Edit {};

LibraryEdit.defaultProps = {
  category: 'libraries',
  FormContents: LibraryFormContents,
  title: 'Edit Library'
};
