"use strict";
import Add from '../../components/Add';
import FileFormContents from './FileFormContents';

export default class FileAdd extends Add {};

FileAdd.defaultProps = {
  category: 'files',
  FormContents: FileFormContents,
  title: 'Add File'
};
