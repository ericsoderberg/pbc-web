import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm';

// http://stackoverflow.com/a/10199306
function hasNativeDateSelector() {
  const input = document.createElement('input');
  input.setAttribute('type', 'date');
  const notADateValue = 'not-a-date';
  input.setAttribute('value', notADateValue);
  return (input.value !== notADateValue);
}

export default class DateTimeInput extends Component {

  constructor(props) {
    super(props);

    this._onDateChange = this._onDateChange.bind(this);
    this._onTimeChange = this._onTimeChange.bind(this);
    this._onDateActivate = this._onDateActivate.bind(this);
    this._onTimeActivate = this._onTimeActivate.bind(this);
    this._onDeactivate = this._onDeactivate.bind(this);
    this._onSelectDate = this._onSelectDate.bind(this);
    this._onSelectTime = this._onSelectTime.bind(this);

    this.state = this._stateFromProps(props);
    this.state.dateActive = false;
    this.state.timeActive = false;
  }

  componentDidMount () {
    if (! hasNativeDateSelector()) {
      this.refs.dateInput.addEventListener('focus', this._onDateActivate);
      this.refs.timeInput.addEventListener('focus', this._onTimeActivate);
    }
  }

  componentWillReceiveProps (newProps) {
    this.setState(this._stateFromProps(newProps));
  }

  _stateFromProps (props) {
    const { value } = props;
    let result = {};
    const date = moment(value);
    if (date.isValid()) {
      result.current = date;
    } else {
      result.current = moment().startOf('hour').add(1, 'hour');
    }
    result.dateValue = result.current.format(DATE_FORMAT);
    result.timeValue = result.current.format(TIME_FORMAT);
    return result;
  }

  _onDateChange (event) {
    const { onChange } = this.props;
    const { timeValue } = this.state;
    const dateValue = event.target.value;
    this.setState({ dateValue });
    if (dateValue.length > 0) {
      const date = moment(dateValue, DATE_FORMAT, true);
      // Only notify if the value looks valid
      if (date.isValid()) {
        if (onChange) {
          const dateTime = moment(`${dateValue} ${timeValue}`,
            `${DATE_FORMAT} ${TIME_FORMAT}`);
          onChange(dateTime);
        }
      }
    }
  }

  _onTimeChange (event) {
    const { onChange } = this.props;
    const { dateValue } = this.state;
    const timeValue = event.target.value;
    this.setState({ timeValue });
    if (timeValue.length > 0) {
      const date = moment(timeValue, TIME_FORMAT, true);
      // Only notify if the value looks valid
      if (date.isValid()) {
        if (onChange) {
          const dateTime = moment(`${dateValue} ${timeValue}`,
            `${DATE_FORMAT} ${TIME_FORMAT}`);
          onChange(dateTime);
        }
      }
    }
  }

  _onSelectDate (date) {
    const { timeValue } = this.state;
    this.setState({ dateActive: false });
    if (this.props.onChange) {
      const dateTime = moment(`${date.format(DATE_FORMAT)} ${timeValue}`,
        `${DATE_FORMAT} ${TIME_FORMAT}`);
      this.props.onChange(dateTime);
    }
  }

  _onSelectTime (time) {
    const { dateValue } = this.state;
    if (this.props.onChange) {
      const dateTime = moment(`${dateValue} ${time.format(TIME_FORMAT)} `,
        `${DATE_FORMAT} ${TIME_FORMAT}`);
      this.props.onChange(dateTime);
    }
  }

  _onDateActivate (event) {
    event.preventDefault();
    this.setState({ dateActive: true });
    document.addEventListener('click', this._onDeactivate);
  }

  _onTimeActivate (event) {
    event.preventDefault();
    this.setState({ timeActive: true });
    document.addEventListener('click', this._onDeactivate);
  }

  _isDescendant (parent, child) {
    var node = child.parentNode;
    while (node != null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  _onDeactivate (event) {
    if (! this._isDescendant(this.refs.component, event.target)) {
      this.setState({ dateActive: false, timeActive: false });
      document.removeEventListener('click', this._onDeactivate);
    }
  }

  render () {
    const { className } = this.props;
    const {
      current, dateActive, dateValue, timeActive, timeValue
    } = this.state;
    let classes = ['date-time-input'];
    if (className) {
      classes.push(className);
    }

    let selector;
    if (dateActive) {
      selector = (
        <DateSelector value={current} onChange={this._onSelectDate} />
      );
    } else if (timeActive) {
      selector = (
        <TimeSelector value={current} onChange={this._onSelectTime} />
      );
    }

    return (
      <div ref='component' className={classes.join(' ')}>
        <input ref='dateInput' className={'date-time-input__input'} type='date'
          value={dateValue}
          onChange={this._onDateChange} onFocus={this._onOpen} />
        <input ref='timeInput' className={'date-time-input__input'} type='time'
          value={timeValue}
          onChange={this._onTimeChange} onFocus={this._onOpen} />
        {selector}
      </div>
    );
  }

}

DateTimeInput.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};
