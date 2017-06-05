import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

function pad(num, size) {
  let s = `${num}`;
  while (s.length < size) s = `0${s}`;
  return s;
}

export default class TimeSelector extends Component {

  _hour(hour) {
    return (event) => {
      event.preventDefault();
      const { value } = this.props;
      const ampmOffset = value.hour() > 12 ? 12 : 0;
      const time = moment(value).hour(hour + ampmOffset);
      this.props.onChange(time);
    };
  }

  _minute(minute) {
    return (event) => {
      event.preventDefault();
      const { value } = this.props;
      const time = moment(value).minute(minute);
      this.props.onChange(time);
    };
  }

  _amPm(ampm) {
    return (event) => {
      event.preventDefault();
      const { value } = this.props;
      const time = moment(value);
      if (time.hour() < 12 && ampm === 'pm') {
        time.hour(time.hour() + 12);
      } else if (time.hour() >= 12 && ampm === 'am') {
        time.hour(time.hour() - 12);
      }
      this.props.onChange(time);
    };
  }

  render() {
    const { value } = this.props;

    const selectedHour = parseInt(value.format('h'), 10);
    const hours = [];
    for (let hour = 1; hour <= 12; hour += 1) {
      const classes = ['time-selector__hour'];
      if (selectedHour === hour) {
        classes.push('time-selector__hour--active');
      }
      hours.push(
        <button key={hour}
          className={classes.join(' ')}
          onClick={this._hour(hour)}>
          {hour}
        </button>,
      );
    }

    const selectedMinute = value.minute();
    const minutes = [];
    for (let minute = 0; minute < 60; minute += 15) {
      const classes = ['time-selector__minute'];
      if (selectedMinute === minute) {
        classes.push('time-selector__minute--active');
      }
      minutes.push(
        <button key={minute}
          className={classes.join(' ')}
          onClick={this._minute(minute)}>
          {pad(minute, 2)}
        </button>,
      );
    }

    const selectedAmPm = (value.hour() >= 12 ? 'pm' : 'am');
    const ampms = ['am', 'pm'].map((ampm) => {
      const classes = ['time-selector__ampm'];
      if (selectedAmPm === ampm) {
        classes.push('time-selector__ampm--active');
      }
      return (
        <button key={ampm}
          className={classes.join(' ')}
          onClick={this._amPm(ampm)}>
          {ampm}
        </button>
      );
    });

    return (
      <div className="time-selector">
        <div className="time-selector__minutes">
          {minutes}
        </div>
        <div className="time-selector__hours">
          {hours}
        </div>
        <div className="time-selector__ampms">
          {ampms}
        </div>
      </div>
    );
  }

}

TimeSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired,
};
