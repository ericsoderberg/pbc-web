import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import DateSelector from './DateSelector';

const DATE_FORMAT = 'YYYY-MM-DD';

// http://stackoverflow.com/a/10199306
function hasNativeDateSelector() {
  const input = document.createElement('input');
  input.setAttribute('type', 'date');
  const notADateValue = 'not-a-date';
  input.setAttribute('value', notADateValue);
  return (input.value !== notADateValue);
}

export default class DateInput extends Component {

  constructor(props) {
    super(props);

    this._onChange = this._onChange.bind(this);
    this._onActivate = this._onActivate.bind(this);
    this._onDeactivate = this._onDeactivate.bind(this);
    this._onSelect = this._onSelect.bind(this);

    this.state = this._stateFromProps(props);
    this.state.active = false;
  }

  componentDidMount() {
    if (!hasNativeDateSelector() && this._dateInputRef) {
      this._dateInputRef.addEventListener('focus', this._onActivate);
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState(this._stateFromProps(newProps));
  }

  componentWillUnmount() {
    if (!hasNativeDateSelector() && this._dateInputRef) {
      this._dateInputRef.removeEventListener('focus', this._onActivate);
    }
  }

  _stateFromProps(props) {
    const { value } = props;
    const result = {};
    const date = moment(value);
    if (date.isValid()) {
      result.current = date;
      result.dateValue = date.format(DATE_FORMAT);
    } else {
      result.current = moment().startOf('hour').add(1, 'hour');
      result.dateValue = value;
    }
    return result;
  }

  _onChange(event) {
    const { onChange } = this.props;
    const dateValue = event.target.value;
    this.setState({ dateValue });
    if (dateValue.length > 0) {
      const date = moment(dateValue, DATE_FORMAT, true);
      // Only notify if the value looks valid
      if (date.isValid()) {
        if (onChange) {
          onChange(date);
        }
      }
    }
  }

  _onSelect(date) {
    this.setState({ active: false });
    if (this.props.onChange) {
      this.props.onChange(date);
    }
  }

  _onActivate(event) {
    event.preventDefault();
    this.setState({ active: true });
    document.addEventListener('click', this._onDeactivate);
  }

  _isDescendant(parent, child) {
    let node = child.parentNode;
    while (node != null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  _onDeactivate(event) {
    if (!this._isDescendant(this._componentRef, event.target)) {
      this.setState({ active: false });
      document.removeEventListener('click', this._onDeactivate);
    }
  }

  render() {
    const { className, inline } = this.props;
    const { active, current, dateValue } = this.state;
    const classes = ['date-input'];
    if (inline) {
      classes.push('date-input--inline');
    }
    if (className) {
      classes.push(className);
    }

    let input;
    let selector;
    if (!inline) {
      input = (
        <input ref={(ref) => { this._dateInputRef = ref; }}
          className={'date-input__input'} type="date"
          value={dateValue}
          onChange={this._onChange} onFocus={this._onOpen} />
      );
    }
    if (active || inline) {
      selector = (
        <DateSelector value={current} onChange={this._onSelect} />
      );
    }

    return (
      <div ref={(ref) => { this._componentRef = ref; }}
        className={classes.join(' ')}>
        {input}
        {selector}
      </div>
    );
  }

}

DateInput.propTypes = {
  className: PropTypes.string,
  inline: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

DateInput.defaultProps = {
  className: undefined,
  inline: false,
};
