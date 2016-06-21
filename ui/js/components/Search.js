"use strict";
import React, { Component, PropTypes } from 'react';
import SearchIcon from '../icons/Search';

export default class Search extends Component {

  constructor () {
    super();
    this._onActivate = this._onActivate.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this.state = { active: false };
  }

  _onActivate (event) {
    this.setState({ active: true }, () => {
      this.refs.input.focus();
    });
  }

  _onBlur (event) {
    this.setState({ active: false });
  }

  render () {
    const { onChange, value } = this.props;
    const { active } = this.state;
    let classNames = ['search'];
    if (active) {
      classNames.push('search--active');
    }
    return (
      <div className={classNames.join(' ')}>
        <input ref="input" className="search__input" placeholder="Search"
          value={value} onChange={onChange} onBlur={this._onBlur} />
        <button className="search__control button-icon" onClick={this._onActivate}>
          <SearchIcon />
        </button>
      </div>
    );
  }
};

Search.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string
};
