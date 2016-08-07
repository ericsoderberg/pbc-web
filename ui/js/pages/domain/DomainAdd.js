"use strict";
import Add from '../../components/Add';
import DomainFormContents from './DomainFormContents';

export default class DomainAdd extends Add {};

DomainAdd.defaultProps = {
  category: 'domains',
  FormContents: DomainFormContents,
  title: 'Add Domain'
};
