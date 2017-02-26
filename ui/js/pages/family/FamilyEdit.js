"use strict";
import Edit from '../../components/Edit';
import FamilyFormContents from './FamilyFormContents';

export default class FamilyEdit extends Edit {};

FamilyEdit.defaultProps = {
  category: 'families',
  FormContents: FamilyFormContents,
  removeBackLevel: 1,
  title: 'Edit Family'
};
