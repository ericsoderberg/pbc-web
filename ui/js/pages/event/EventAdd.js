"use strict";
import Add from '../../components/Add';
import EventFormContents from './EventFormContents';

export default class EventAdd extends Add {};

EventAdd.defaultProps = {
  category: 'events',
  FormContents: EventFormContents,
  title: 'Add Event'
};
