"use strict";
import React, { Component, PropTypes } from 'react';
import FilterIcon from '../icons/Filter';

export default class Filter extends Component {

  constructor () {
    super();
    this._onActivate = this._onActivate.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this.state = { active: false };
  }

  _onActivate (event) {
    this.setState({ active: true }, () => {
      this.refs.select.focus();
    });
  }

  _onBlur (event) {
    this.setState({ active: false });
  }

  render () {
    const { onChange, value, options } = this.props;
    const { active } = this.state;
    let classNames = ['filter'];
    if (active) {
      classNames.push('filter--active');
    }

    let optionElements = (options || []).map(option => (
      <option key={option}>{option}</option>
    ));
    optionElements.unshift(<option key="_all">All</option>);

    return (
      <div className={classNames.join(' ')}>
        <select ref="select" className="filter__select"
          value={value} onChange={onChange} onBlur={this._onBlur}>
          {optionElements}
        </select>
        <button className="filter__control button-icon" onClick={this._onActivate}>
          <FilterIcon />
        </button>
      </div>
    );
  }
};

Filter.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string)
};
