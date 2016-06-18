// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import moment from 'moment';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DATE_REGEXP = new RegExp('[MDY]');
const TIME_REGEXP = new RegExp('[hHmsa]');

export default class DateTimeDetails extends Component {

  constructor(props) {
    super(props);

    this._onDay = this._onDay.bind(this);
    this._onToday = this._onToday.bind(this);
    this._onPrevious = this._onPrevious.bind(this);
    this._onNext = this._onNext.bind(this);

    this.state = this._stateFromProps(props);
  }

  componentWillReceiveProps (nextProps) {
    const state = this._stateFromProps(nextProps);
    this.setState(state);
  }

  _stateFromProps (props) {
    const { format } = props;
    let result = {};
    const value = moment(props.value);
    if (value.isValid()) {
      result.value = value;
      result.timeOfDay = {
        hours: value.hours(),
        minutes: value.minutes(),
        seconds: value.seconds()
      };
    } else {
      result.value = moment();
    }
    // figure out which scope the step should apply to
    if (format.indexOf('s') !== -1) {
      result.stepScope = 'second';
    } else if (format.indexOf('m') !== -1) {
      result.stepScope = 'minute';
    } else if (format.indexOf('h') !== -1) {
      result.stepScope = 'hour';
    }
    return result;
  }

  _onDay (date) {
    this.props.onChange(date);
  }

  _onToday () {
    const today = moment().startOf('day').add(this.state.timeOfDay);
    this.setState({ value: today });
    this.props.onChange(today);
  }

  _onPrevious (scope) {
    const delta = (scope === this.state.stepScope ? this.props.step : 1);
    const value = moment(this.state.value).subtract(delta, scope);
    this.setState({ value: value });
    this.props.onChange(value);
  }

  _onNext (scope) {
    const delta = (scope === this.state.stepScope ? this.props.step : 1);
    const value = moment(this.state.value).add(delta, scope);
    this.setState({ value: value });
    this.props.onChange(value);
  }

  _renderDate () {
    const { value, timeOfDay } = this.state;

    const headerCells = WEEK_DAYS.map(function (day) {
      return <th key={day}>{day}</th>;
    });

    const start = moment(value).startOf('month').startOf('week').add(timeOfDay);
    const end = moment(value).endOf('month').endOf('week').add(timeOfDay);
    let date = moment(start);
    let rows = [];

    while (date.valueOf() <= end.valueOf()) {
      let days = [];
      for (let i = 0; i < 7; i += 1) {
        const classes = ['date-time__day'];
        if (date.isSame(value, 'day')) {
          classes.push('date-time__day--active');
        }
        if (! date.isSame(value, 'month')) {
          classes.push('date-time__day--other-month');
        }
        days.push(
          <td key={date.valueOf()}>
            <div className={classes.join(' ')}
              onClick={this._onDay.bind(this, moment(date))}>
              {date.date()}
            </div>
          </td>
        );
        date.add(1, 'days');
      }
      rows.push(<tr key={date.valueOf()}>{days}</tr>);
    }

    return [
      <header key="header" className="date-time__header">
        <button type="button" className="button date-time__previous"
          onClick={this._onPrevious.bind(this, 'month')}>&lt;</button>
        <span className="date-time__title">
          {value.format('MMMM YYYY')}
        </span>
        <button type="button" className="button date-time__next"
          onClick={this._onNext.bind(this, 'month')}>&gt;</button>
      </header>,
      <div key="grid" className="date-time__grid">
        <table>
          <thead>
            <tr>{headerCells}</tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>,
      <button key="today" type="button" className="button date-time__today"
        onClick={this._onToday}>Today</button>
    ];
  }

  _renderTimeElement (value, format, propertyName) {
    return (
      <div key={format} className="date-time__time-select">
        <button type="button" className="button"
          onClick={this._onPrevious.bind(this, propertyName)}>-</button>
        <span className="date-time__time-element">{value.format(format)}</span>
        <button type="button" className="button"
          onClick={this._onNext.bind(this, propertyName)}>+</button>
      </div>
    );
  }

  _renderTime () {
    const { format } = this.props;
    const { value } = this.state;
    let elements = [];
    if (format.indexOf('h') !== -1) {
      elements.push(this._renderTimeElement(value, 'h', 'hour'));
    } else if (format.indexOf('H') !== -1) {
      elements.push(this._renderTimeElement(value, 'H', 'hour'));
    }
    if (format.indexOf('m') !== -1) {
      elements.push(this._renderTimeElement(value, 'mm', 'minute'));
    }
    if (format.indexOf('s') !== -1) {
      elements.push(this._renderTimeElement(value, 's', 'second'));
    }
    if (format.indexOf('a') !== -1) {
      elements.push(this._renderTimeElement(value, 'a', 'ampm'));
    }
    return (
      <div className={'date-time__time'}>
        {elements}
      </div>
    );
  }

  render () {
    const { format } = this.props;

    let date, time;
    if (DATE_REGEXP.test(format)) {
      date = this._renderDate();
    }

    if (TIME_REGEXP.test(format)) {
      time = this._renderTime();
    }

    return (
      <div className="date-time__details" onClick={this._onDeactivate}>
        {date}
        {time}
      </div>
    );
  }

}

DateTimeDetails.propTypes = {
  format: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  step: PropTypes.number.isRequired,
  value: PropTypes.object.isRequired
};
