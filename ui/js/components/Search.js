import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SearchIcon from '../icons/Search';

export default class Search extends Component {

  constructor() {
    super();
    this._onActivate = this._onActivate.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this.state = { active: false };
  }

  componentDidMount() {
    const { focusOnMount } = this.props;
    if (focusOnMount) {
      this._inputRef.focus();
    }
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  _onActivate() {
    this.setState({ active: true }, () => {
      this._inputRef.focus();
    });
  }

  _onBlur() {
    setTimeout(() => {
      if (!this._unmounted) {
        this.setState({ active: false });
      }
    }, 10);
  }

  render() {
    const { className, onChange, placeholder, responsive, value } = this.props;
    const { active } = this.state;
    const classNames = ['search'];
    if (responsive) {
      classNames.push('search--responsive');
    }
    if (active) {
      classNames.push('search--active');
    }
    if (className) {
      classNames.push(className);
    }

    return (
      <div className={classNames.join(' ')}>
        <input ref={(ref) => { this._inputRef = ref; }}
          className="search__input"
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
          onBlur={this._onBlur} />
        <button className="search__control button-icon"
          onClick={!active ? this._onActivate : undefined}>
          <SearchIcon />
        </button>
      </div>
    );
  }
}

Search.propTypes = {
  className: PropTypes.string,
  focusOnMount: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  responsive: PropTypes.bool,
  value: PropTypes.string,
};

Search.defaultProps = {
  className: undefined,
  focusOnMount: false,
  placeholder: 'Search',
  responsive: false,
  value: '',
};
