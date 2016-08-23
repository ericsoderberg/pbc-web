// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { getItems } from '../actions';
import KeyboardAccelerators from '../utils/KeyboardAccelerators';
import SearchIcon from '../icons/Search';

export default class SelectSearch extends Component {

  constructor(props) {
    super(props);

    this._onDeactivate = this._onDeactivate.bind(this);
    this._onToggle = this._onToggle.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this._onSearch = this._onSearch.bind(this);

    this.state = { active: props.active, searchText: '' };
  }

  componentDidMount () {
    if (this.props.active) {
      this._activation(true);
    }
  }

  componentDidUpdate (prevProps, prevState) {
    // Set up keyboard listeners appropriate to the current state.
    if (prevState.active !== this.state.active) {
      this._activation(this.state.active);
    }
  }

  componentWillUnmount () {
    this._activation(false);
  }

  _onToggle (event) {
    event.preventDefault();
    this.setState({ active: ! this.state.active });
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
      this.setState({ active: false });
    }
  }

  _onSelect (suggestion) {
    this.setState({ active: false });
    this.props.onChange(suggestion);
  }

  _onSearch (event) {
    const searchText = event.target.value;
    this.setState({ searchText: searchText });
    const { category, exclude, options } = this.props;
    getItems(category,
      { select: 'name', sort: 'name', ...(options || {}), search: searchText })
    .then(response => {
      const suggestions = response
      .filter(item => ! (exclude || []).some(item2 => item._id === item2._id));
      this.setState({ suggestions: suggestions });
    })
    .catch(error => console.log('SelectSearch catch', error));
  }

  _activation (active) {
    const listeners = {
      esc: this._onDeactivate,
      tab: this._onDeactivate
    };

    if (active) {
      document.addEventListener('click', this._onDeactivate);
      KeyboardAccelerators.startListeningToKeyboard(this, listeners);
      this.refs.input.focus();
    } else {
      document.removeEventListener('click', this._onDeactivate);
      KeyboardAccelerators.stopListeningToKeyboard(this, listeners);
    }
  }

  render () {
    const { className, Suggestion } = this.props;
    const { active, searchText, suggestions } = this.state;
    let classes = ['select-search'];
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
    if (! value) {
      classes.push('select-search--empty');
    }

    let details;
    if (active) {
      let suggests = (suggestions || []).map((suggestion, index) => (
        <div key={index} className="select-search__suggestion"
          onClick={this._onSelect.bind(this, suggestion)}>
          {Suggestion ? <Suggestion item={suggestion} /> : suggestion.name}
        </div>
      ));
      details = (
        <div className={'select-search__drop'}>
          <input ref="input" className="select-search__input"
            placeholder="Search"
            value={searchText} onChange={this._onSearch} />
          {suggests}
        </div>
      );
    }

    return (
      <div ref="component" className={classes.join(' ')}>
        <div className={'select-search__value'}>
          {value}
        </div>
        <button className="select-search__control button-icon"
          onClick={this._onToggle}>
          <SearchIcon />
        </button>
        {details}
      </div>
    );
  }

}

SelectSearch.propTypes = {
  active: PropTypes.bool,
  category: PropTypes.string,
  exclude: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string
  })),
  onChange: PropTypes.func,
  options: PropTypes.object,
  Suggestion: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      name: PropTypes.node.isRequired
    })
  ])
};
