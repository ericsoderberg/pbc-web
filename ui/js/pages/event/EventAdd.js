"use strict";
import Add from '../../components/Add';
import EventFormContents from './EventFormContents';
import EventPreview from './EventPreview';

export default class EventAdd extends Add {};

EventAdd.defaultProps = {
  category: 'events',
  FormContents: EventFormContents,
  Preview: EventPreview,
  title: 'Add Event'
};
