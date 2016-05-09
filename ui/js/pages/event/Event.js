"use strict";
import Show from '../../components/Show';
import EventContents from './EventContents';

export default class Event extends Show {};

Event.defaultProps = {
  category: 'events',
  Contents: EventContents
};
