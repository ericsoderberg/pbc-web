"use strict";
import React, { Component, PropTypes } from 'react';
// import { findDOMNode } from 'react-dom';
import { getItem } from '../../actions';
import Section from '../../components/Section';
import Button from '../../components/Button';

export default class CalendarSummary extends Component {

  constructor (props) {
    super(props);
    // this._onScroll = this._onScroll.bind(this);
    this.state = {
      offset: 0,
      calendar: (typeof props.id === 'string' ? props.id : {})
    };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.id !== nextProps.id) {
      this._load(nextProps);
    }
  }

  _load (props) {
    if (props.id) {
      // let calendarId;
      if (typeof props.id === 'object') {
        // calendarId = props.id._id;
        this.setState({ calendar: props.id });
      } else {
        // calendarId = props.id;
        getItem('calendars', props.id)
        .then(calendar => this.setState({ calendar }))
        .catch(error => console.log('!!! CalendarSummary calendar catch',
          error));
      }
    }
  }

  // _onScroll (event) {
  //   const elem = findDOMNode(this.refs.image);
  //   if (elem) { // might not have an image
  //     const rect = elem.getBoundingClientRect();
  //     if (rect.top < 0) {
  //       this.setState({ offset: Math.floor(Math.abs(rect.top) / 20) });
  //     }
  //   }
  // }

  _renderCalendar (calendar) {
    return (
      <Button path={`/calendars/${calendar.path || calendar._id}`} right={true}>
        Events
      </Button>
    );
  }

  render () {
    const { color, full } = this.props;
    const { calendar } = this.state;
    let plain = full;

    let contents = this._renderCalendar(calendar);

    return (
      <Section color={color} full={full} plain={plain}>
        <div className="calendar-summary">
          {contents}
        </div>
      </Section>
    );
  }
};

CalendarSummary.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  ...Section.propTypes
};
