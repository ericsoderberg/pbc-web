"use strict";
import Edit from '../../components/Edit';
import DomainFormContents from './DomainFormContents';

export default class DomainEdit extends Edit {};

DomainEdit.defaultProps = {
  category: 'domains',
  FormContents: DomainFormContents,
  title: 'Edit Domain'
};