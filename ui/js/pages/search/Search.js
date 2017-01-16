"use strict";
import React, { Component } from 'react';
import { Link } from 'react-router';
import { getSearch } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Text from '../../components/Text';
import EventTimes from '../../components/EventTimes';
import Loading from '../../components/Loading';
import { getLocationParams, pushLocationParams } from '../../utils/Params';

export default class Search extends Component {

  constructor () {
    super();
    this._onSearch = this._onSearch.bind(this);
    this._get = this._get.bind(this);
    this.state = { items: [], searchText: '' };
  }

  componentDidMount () {
    document.title = 'Search';
    const params = getLocationParams();
    if (params.q) {
      this.setState({ searchText: params.q || '' }, this._get);
    }
  }

  _get () {
    const { searchText } = this.state;
    if (searchText) {
      getSearch(searchText)
      .then(items => this.setState({ items, loading: false }))
      .catch(error => console.log('!!! Search catch', error));
    } else {
      this.setState({ items: [] });
    }
  }

  _onSearch (event) {
    const searchText = event.target.value;
    this.setState({ searchText: searchText, loading: true });
    pushLocationParams({ q: searchText });
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(this._get, 100);
  }

  render () {
    const { items, loading, searchText } = this.state;

    let contents = items.map(item => {
      let content, path;
      if (item.hasOwnProperty('sections')) {
        // Page
        content = item.sections.map(section => (
          <Text key={section._id} text={section.text} />
        ));
        path = item.path || `/pages/${item._id}`;
      } else if (item.hasOwnProperty('start')) {
        // Event
        content = [
          <EventTimes key="event" event={item} />,
          <Text key="text" text={item.text} />
        ];
        path = `/events/${item.path || item._id}`;
      }
      return (
        <div className="search__item" key={item._id}>
          <Link className="search__link" to={path}>
            {item.name}
          </Link>
          {content}
        </div>
      );
    });

    if (contents.length === 0) {
      if (loading) {
        contents = <Loading />;
      } else {
        const message = searchText ? 'No matches' : 'Awaiting your input';
        contents = <div className="search__message">{message}</div>;
      }
    }

    return (
      <main>
        <PageHeader homer={true} responsive={false} focusOnSearch={true}
          searchText={searchText} onSearch={this._onSearch} />
        {contents}
      </main>
    );
  }
};
