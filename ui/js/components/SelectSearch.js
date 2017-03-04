// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { getItems } from '../actions';
import Button from './Button';
import KeyboardAccelerators from '../utils/KeyboardAccelerators';
import DownIcon from '../icons/Down';
import UpIcon from '../icons/Up';
import CloseIcon from '../icons/Close';

export default class SelectSearch extends Component {

  constructor(props) {
    super(props);

    this._onDeactivate = this._onDeactivate.bind(this);
    this._onToggle = this._onToggle.bind(this);
    this._onSearch = this._onSearch.bind(this);

    this.state = { active: props.active, searchText: '' };
  }

  componentDidMount() {
    if (this.props.active) {
      this._activation(true);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Set up keyboard listeners appropriate to the current state.
    if (prevState.active !== this.state.active) {
      this._activation(this.state.active);
    }
  }

  componentWillUnmount() {
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

  _onClear() {
    this.setState({ active: false });
    this.props.onChange(undefined);
  }

  _onSearch(event) {
    const searchText = event.target.value;
    this.setState({ searchText });
    const { category, exclude, options } = this.props;
    getItems(category,
      { select: 'name', sort: 'name', ...(options || {}), search: searchText })
    .then((response) => {
      const suggestions = response
      .filter(item => !(exclude || []).some(item2 => item._id === item2._id));
      this.setState({ suggestions });
    })
    .catch(error => console.error('!!! SelectSearch catch', error));
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
        <Button className="select-search__clear" icon={<CloseIcon />}
          onClick={this._onClear} />
      );
    }

    let details;
    let Icon = DownIcon;
    if (active) {
      Icon = UpIcon;
      const suggests = (suggestions || []).map(suggestion => (
        <div key={suggestion._id} className="select-search__suggestion"
          onClick={this._select(suggestion)}>
          {Suggestion ? <Suggestion item={suggestion} /> : suggestion.name}
        </div>
      ));
      details = (
        <div className={'select-search__drop'}>
          <input ref={(ref) => { this._inputRef = ref; }}
            className="select-search__input"
            placeholder="Search"
            value={searchText} onChange={this._onSearch} />
          {suggests}
        </div>
      );
    }

    return (
      <div ref={(ref) => { this._componentRef = ref; }}
        className={classes.join(' ')}>
        <div className="select-search__header" onClick={this._onToggle}>
          <input className="select-search__value" disabled={true}
            placeholder={placeholder} value={value} />
          {clearControl}
          <Button className="select-search__control" icon={<Icon />} />
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
  exclude: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
  })),
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
  options: undefined,
  placeholder: undefined,
  Suggestion: undefined,
  value: '',
};
