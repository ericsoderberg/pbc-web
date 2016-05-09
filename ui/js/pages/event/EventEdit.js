"use strict";
import Edit from '../../components/Edit';
import EventFormContents from './EventFormContents';
import EventPreview from './EventPreview';

export default class EventEdit extends Edit {};

EventEdit.defaultProps = {
  category: 'events',
  FormContents: EventFormContents,
  Preview: EventPreview,
  title: 'Edit Event'
};
