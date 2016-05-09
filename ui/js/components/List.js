"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItems } from '../actions';
import PageHeader from './PageHeader';

export default class List extends Component {

  constructor () {
    super();
    this._onSearch = this._onSearch.bind(this);
    this.state = { items: [], searchText: '' };
  }

  componentDidMount () {
    getItems(this.props.category)
    .then(response => this.setState({ items: response }))
    .catch(error => console.log('!!! List catch', error));
  }

  _onSearch (event) {
    const searchText = event.target.value;
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      getItems(this.props.category, searchText)
      .then(response => this.setState({ items: response }))
      .catch(error => console.log('!!! List catch', error));
    }, 100);
    this.setState({ searchText: searchText });
  }

  render () {
    const { Item, path, searchText, title } = this.props;

    const items = this.state.items.map(item => {
      return (
        <li key={item._id} >
          <Item className="list__item" item={item} />
        </li>
      );
    });

    const addControl = <Link to={`${path}/add`} className="a--header">Add</Link>;

    return (
      <main>
        <PageHeader title={title}
          searchText={searchText} onSearch={this._onSearch}
          actions={addControl} />
        <ul className="list">
          {items}
        </ul>
      </main>
    );
  }
};

List.propTypes = {
  category: PropTypes.string,
  Item: PropTypes.func.isRequired,
  path: PropTypes.string,
  title: PropTypes.string
};
