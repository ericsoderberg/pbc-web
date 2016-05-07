"use strict";
import Edit from '../../components/Edit';
import EventForm from './EventForm';

export default class EventEdit extends Edit {};

EventEdit.defaultProps = {
  category: 'events',
  Form: EventForm,
  title: 'Edit Event'
};
