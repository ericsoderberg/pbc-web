"use strict";
import Edit from '../../components/Edit';
import EventFormContents from './EventFormContents';

export default class EventEdit extends Edit {};

EventEdit.defaultProps = {
  category: 'events',
  FormContents: EventFormContents,
  title: 'Edit Event'
};
