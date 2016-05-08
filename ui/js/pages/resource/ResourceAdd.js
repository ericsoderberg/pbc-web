"use strict";
import Add from '../../components/Add';
import ResourceFormContents from './ResourceFormContents';

export default class ResourceAdd extends Add {};

ResourceAdd.defaultProps = {
  category: 'resources',
  FormContents: ResourceFormContents,
  title: 'Add Resource'
};
