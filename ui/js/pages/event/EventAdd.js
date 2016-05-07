"use strict";
import Add from '../../components/Add';
import EventForm from './EventForm';

export default class EventAdd extends Add {};

EventAdd.defaultProps = {
  category: 'events',
  Form: EventForm,
  title: 'Add Event'
};
