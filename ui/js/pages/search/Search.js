"use strict";
import React, { Component } from 'react';
import { Link } from 'react-router';
import { getSearch } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Text from '../../components/Text';

export default class Search extends Component {

  constructor () {
    super();
    this._onSearch = this._onSearch.bind(this);
    this.state = { items: [], searchText: '' };
  }

  componentDidMount () {

  }

  _onSearch (event) {
    const searchText = event.target.value;
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      if (searchText) {
        getSearch(searchText)
        .then(response => this.setState({ items: response }))
        .catch(error => console.log('!!! Search catch', error));
      } else {
        this.setState({ items: [] });
      }
    }, 100);
    this.setState({ searchText: searchText });
  }

  render () {
    const { searchText, items } = this.state;

    const elements = items.map(item => {
      const texts = item.sections.map(section => (
        <Text key={section._id} text={section.text} />
      ));
      return (
        <div className="search__item" key={item._id}>
          <Link className="search__link" to={item.path || `/pages/${item._id}`}>
            {item.name}
          </Link>
          {texts}
        </div>
      );
    });

    return (
      <main>
        <PageHeader homer={true}
          searchText={searchText} onSearch={this._onSearch}
          focusOnSearch={true} />
        {elements}
      </main>
    );
  }
};
