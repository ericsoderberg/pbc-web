import React, { Component, PropTypes } from 'react';
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
    const { onChange, responsive, value } = this.props;
    const { active } = this.state;
    const classNames = ['search'];
    if (responsive) {
      classNames.push('search--responsive');
    }
    if (active) {
      classNames.push('search--active');
    }

    return (
      <div className={classNames.join(' ')}>
        <input ref={(ref) => { this._inputRef = ref; }}
          className="search__input" placeholder="Search"
          value={value || ''} onChange={onChange} onBlur={this._onBlur} />
        <button className="search__control button-icon"
          onClick={!active ? this._onActivate : undefined}>
          <SearchIcon />
        </button>
      </div>
    );
  }
}

Search.propTypes = {
  focusOnMount: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  responsive: PropTypes.bool,
  value: PropTypes.string,
};

Search.defaultProps = {
  focusOnMount: false,
  responsive: false,
  value: '',
};
