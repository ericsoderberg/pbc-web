"use strict";
import Edit from '../../components/Edit';
import ResourceFormContents from './ResourceFormContents';

export default class ResourceEdit extends Edit {};

ResourceEdit.defaultProps = {
  category: 'resources',
  FormContents: ResourceFormContents,
  title: 'Edit Resource'
};