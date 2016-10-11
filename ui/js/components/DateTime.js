// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import KeyboardAccelerators from '../utils/KeyboardAccelerators';
import DateTimeDetails from './DateTimeDetails';

const FORMATS = {
  M: 'months',
  D: 'days',
  Y: 'years',
  H: 'hours',
  h: 'hours',
  m: 'minutes',
  s: 'seconds'
};

export default class DateTime extends Component {

  constructor(props) {
    super(props);

    this._onInputChange = this._onInputChange.bind(this);
    this._onActivate = this._onActivate.bind(this);
    this._onDeactivate = this._onDeactivate.bind(this);
    this._onNext = this._onNext.bind(this);
    this._onPrevious = this._onPrevious.bind(this);
    this._notify = this._notify.bind(this);

    this.state = this._stateFromProps(props);
    this.state.cursor = -1;
    this.state.active = false;
  }

  componentDidMount () {
    this._activation(this.state.active);
    this.refs.input.addEventListener('focus', this._onActivate);
  }

  componentWillReceiveProps (newProps) {
    this.setState(this._stateFromProps(newProps));
  }

  componentDidUpdate (prevProps, prevState) {
    // Set up keyboard listeners appropriate to the current state.
    if (prevState.active !== this.state.active) {
      this._activation(this.state.active);
    }
    if (this.state.cursor >= 0) {
      this.refs.input.setSelectionRange(this.state.cursor,this.state.cursor);
    }
  }

  componentWillUnmount () {
    this._activation(false);
  }

  _convertIfISO8601 (value) {
    if (value && typeof value === 'string' && value.match(/.+T.+Z/)) {
      value = moment(value);
    }
    return value;
  }

  _stateFromProps (props) {
    let { value, format } = props;
    let result = { current: undefined };
    value = this._convertIfISO8601(value);
    const date = moment(value, format);
    if (date.isValid()) {
      result.current = date;
    } else {
      result.current = moment().startOf('hour').add(1, 'hour');
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

  _onInputChange (event) {
    const { format, onChange } = this.props;
    const value = event.target.value;
    if (value.length > 0) {
      const date = moment(value, format);
      // Only notify if the value looks valid
      if (date.isValid() && ! date.parsingFlags().charsLeftOver) {
        if (onChange) {
          onChange(value);
        }
      } else if (typeof this.props.value === 'string' &&
        value.length < this.props.value.length) {
        // or if the user is removing characters
        if (onChange) {
          onChange(value);
        }
      }
    } else {
      if (onChange) {
        onChange(value);
      }
    }
  }

  _notify (date) {
    if (this.props.onChange) {
      this.props.onChange(date);
    }
  }

  _onActivate (event) {
    event.preventDefault();
    this.setState({active: true});
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
      this.setState({active: false, cursor: -1});
    }
  }

  _onNext (event) {
    event.preventDefault();
    let date = this.state.current.clone();
    const scope = this._cursorScope();
    if ('a' === scope) {
      if (date.hours() < 12) {
        date.add(12, 'hours');
      }
    } else if ('m' === scope) {
      date.add(this.props.step, FORMATS[scope]);
    } else {
      date.add(1, FORMATS[scope]);
    }
    this.setState({ current: date }, this._notify(date));
  }

  _onPrevious (event) {
    event.preventDefault();
    let date = this.state.current.clone();
    const scope = this._cursorScope();
    if ('a' === scope) {
      if (date.hours() >= 12) {
        date.subtract(12, 'hours');
      }
    } else if ('m' === scope) {
      date.subtract(this.props.step, FORMATS[scope]);
    } else {
      date.subtract(1, FORMATS[scope]);
    }
    this.setState({ current: date }, this._notify(date));
  }

  _cursorScope () {
    const { format } = this.props;
    const input = this.refs.input;
    const value = input.value;
    const end = input.selectionEnd;
    this.setState({ cursor: end });
    // Figure out which aspect of the date the cursor is on, so we know what
    // to change.
    const preDate = moment(value.slice(0, end+1), format);
    const formatTokens = format.split(/[^A-Za-z]/);
    const unusedTokens = preDate.parsingFlags().unusedTokens;
    let index = -1;
    while (formatTokens[index+1] !== unusedTokens[0]) {
      index += 1;
    }
    return formatTokens[index][0];
  }

  _activation (active) {

    var listeners = {
      esc: this._onDeactivate,
      tab: this._onDeactivate,
      enter: this._onSelectDate,
      up: this._onPrevious,
      down: this._onNext
    };

    if (active) {
      document.addEventListener('click', this._onDeactivate);
      KeyboardAccelerators.startListeningToKeyboard(this, listeners);
    } else {
      document.removeEventListener('click', this._onDeactivate);
      KeyboardAccelerators.stopListeningToKeyboard(this, listeners);
    }
  }

  render () {
    const { className, format, id, inline, name } = this.props;
    const { active } = this.state;
    let { value } = this.props;
    let classes = ['date-time'];
    if (active) {
      classes.push('date-time--active');
    }
    if (inline) {
      classes.push('date-time--inline');
    }
    if (className) {
      classes.push(className);
    }
    value = this._convertIfISO8601(value);
    if (typeof value === 'object') {
      value = value.format(format);
    }

    let details;
    if (active || inline) {
      details = (
        <DateTimeDetails format={this.props.format} value={this.state.current}
          step={this.props.step} onChange={this._notify}/>
      );
    }

    return (
      <div ref="component" className={classes.join(' ')}>
        <input ref="input" className={'date-time__input'}
          id={id} placeholder={format} name={name} value={value}
          onChange={this._onInputChange} onFocus={this._onOpen} />
        {details}
      </div>
    );
  }

}

DateTime.propTypes = {
  format: PropTypes.string,
  id: PropTypes.string,
  inline: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
  step: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

DateTime.defaultProps = {
  format: 'M/D/YYYY h:mm a',
  step: 1
};
