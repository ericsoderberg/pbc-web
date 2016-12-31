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

  componentDidMount () {
    const { focusOnMount } = this.props;
    if (focusOnMount) {
      this.refs.input.focus();
    }
  }

  _onActivate (event) {
    this.setState({ active: true }, () => {
      this.refs.input.focus();
    });
  }

  _onBlur (event) {
    setTimeout(() => {
      this.setState({ active: false });
    }, 10);
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
          value={value || ''} onChange={onChange} onBlur={this._onBlur} />
        <button className="search__control button-icon"
          onClick={! active ? this._onActivate : undefined}>
          <SearchIcon />
        </button>
      </div>
    );
  }
};

Search.propTypes = {
  focusOnMount: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string
};
