// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../actions';
import Button from './Button';
import KeyboardAccelerators from '../utils/KeyboardAccelerators';
import DownIcon from '../icons/Down';
import UpIcon from '../icons/Up';
import CloseIcon from '../icons/Close';

class SelectSearch extends Component {

  constructor(props) {
    super(props);

    this._onDeactivate = this._onDeactivate.bind(this);
    this._onToggle = this._onToggle.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this._onClear = this._onClear.bind(this);

    this.state = { active: props.active, searchText: '' };
  }

  componentDidMount() {
    if (this.props.active) {
      this._activation(true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { exclude, items } = nextProps;
    if (items) {
      const suggestions = items
      .filter(item => !(exclude || []).some(item2 => item._id === item2._id));
      this.setState({ suggestions });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Set up keyboard listeners appropriate to the current state.
    if (prevState.active !== this.state.active) {
      this._activation(this.state.active);
    }
  }

  componentWillUnmount() {
    const { category, dispatch } = this.props;
    dispatch(unloadCategory(category));
    this._activation(false);
  }

  _onToggle(event) {
    event.preventDefault();
    this.setState({ active: !this.state.active });
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
    }
  }

  _select(suggestion) {
    return () => {
      this.setState({ active: false });
      this.props.onChange(suggestion);
    };
  }

  _onClear(event) {
    event.stopPropagation();
    this.setState({ active: false });
    this.props.onChange(undefined);
  }

  _onSearch(event) {
    const { category, dispatch, options } = this.props;
    const searchText = event.target.value;
    this.setState({ searchText });
    dispatch(loadCategory(category,
      { select: 'name', sort: 'name', ...options, search: searchText },
      'suggestions'));
  }

  _activation(active) {
    const listeners = {
      esc: this._onDeactivate,
      tab: this._onDeactivate,
    };

    if (active) {
      document.addEventListener('click', this._onDeactivate);
      KeyboardAccelerators.startListeningToKeyboard(this, listeners);
      this._inputRef.focus();
    } else {
      document.removeEventListener('click', this._onDeactivate);
      KeyboardAccelerators.stopListeningToKeyboard(this, listeners);
    }
  }

  render() {
    const { className, clearable, placeholder, Suggestion } = this.props;
    const { active, searchText, suggestions } = this.state;
    const classes = ['select-search'];
    if (active) {
      classes.push('select-search--active');
    }
    if (className) {
      classes.push(className);
    }

    let value = this.props.value;
    if (typeof this.props.value === 'object') {
      value = value.name;
    }
    let clearControl;
    if (clearable && value) {
      clearControl = (
        <Button className="select-search__clear"
          icon={<CloseIcon className="select-search__clear-icon" />}
          onClick={this._onClear} />
      );
    }

    let details;
    let Icon = DownIcon;
    if (active) {
      Icon = UpIcon;
      const suggests = (suggestions || []).map(suggestion => (
        <div key={suggestion._id}
          className="select-search__suggestion"
          onClick={this._select(suggestion)}>
          {Suggestion ? <Suggestion item={suggestion} /> : suggestion.name}
        </div>
      ));
      details = (
        <div className={'select-search__drop'}>
          <input ref={(ref) => { this._inputRef = ref; }}
            className="select-search__input"
            placeholder="Search"
            value={searchText}
            onChange={this._onSearch} />
          {suggests}
        </div>
      );
    }

    return (
      <div ref={(ref) => { this._componentRef = ref; }}
        className={classes.join(' ')}>
        <div className="select-search__header" onClick={this._onToggle}>
          <input className="select-search__value"
            disabled={true}
            placeholder={placeholder}
            value={value} />
          {clearControl}
          <Button className="select-search__control"
            icon={<Icon className="select-search__control-icon" />} />
        </div>
        {details}
      </div>
    );
  }

}

SelectSearch.propTypes = {
  active: PropTypes.bool,
  category: PropTypes.string.isRequired,
  className: PropTypes.string,
  clearable: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  exclude: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
  })),
  items: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.object,
  placeholder: PropTypes.string,
  Suggestion: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      name: PropTypes.node.isRequired,
    }),
  ]),
};

SelectSearch.defaultProps = {
  active: false,
  className: undefined,
  clearable: false,
  exclude: [],
  items: [],
  options: {},
  placeholder: undefined,
  Suggestion: undefined,
  value: '',
};

const select = (state, props) => ({
  items: ((state.suggestions || {})[props.category] || {}).items || [],
});

export default connect(select)(SelectSearch);
