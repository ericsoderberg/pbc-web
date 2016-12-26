import React, { Component, PropTypes } from 'react';
import moment from 'moment';

function pad(num, size) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

export default class TimeSelector extends Component {

  constructor() {
    super();
    this._onHour = this._onHour.bind(this);
    this._onMinute = this._onMinute.bind(this);
    this._onAmPm = this._onAmPm.bind(this);
  }

  _onHour (hour) {
    const { value } = this.props;
    const ampmOffset = value.hour() > 12 ? 12 : 0;
    const time = moment(value).hour(hour + ampmOffset);
    this.props.onChange(time);
  }

  _onMinute (minute) {
    const { value } = this.props;
    const time = moment(value).minute(minute);
    this.props.onChange(time);
  }

  _onAmPm (ampm) {
    const { value } = this.props;
    let time = moment(value);
    if (time.hour() <= 12 && 'pm' === ampm) {
      time.hour(time.hour() + 12);
    } else if (time.hour() > 12 && 'am' === ampm) {
      time.hour(time.hour() - 12);
    }
    this.props.onChange(time);
  }

  render () {
    const { value } = this.props;

    const selectedHour = parseInt(value.format('h'), 10);
    let hours = [];
    for (let hour = 1; hour <= 12; hour += 1) {
      const classes = ['time-selector__hour'];
      if (selectedHour === hour) {
        classes.push('time-selector__hour--active');
      }
      hours.push(
        <div key={hour} className={classes.join(' ')}
          onClick={this._onHour.bind(this, hour)}>
          {hour}
        </div>
      );
    }

    const selectedMinute = value.minute();
    let minutes = [];
    for (let minute = 0; minute < 60; minute += 15) {
      const classes = ['time-selector__minute'];
      if (selectedMinute === minute) {
        classes.push('time-selector__minute--active');
      }
      minutes.push(
        <div key={minute} className={classes.join(' ')}
          onClick={this._onMinute.bind(this, minute)}>
          {pad(minute, 2)}
        </div>
      );
    }

    const selectedAmPm = (value.hour() > 12 ? 'pm' : 'am');
    let ampms = ['am', 'pm'].map(ampm => {
      const classes = ['time-selector__ampm'];
      if (selectedAmPm === ampm) {
        classes.push('time-selector__ampm--active');
      }
      return (
        <div key={ampm} className={classes.join(' ')}
          onClick={this._onAmPm.bind(this, ampm)}>
          {ampm}
        </div>
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
  value: PropTypes.object.isRequired
};
