"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItems } from '../actions';
import PageHeader from './PageHeader';
import Filter from './Filter';
import Stored from './Stored';

class List extends Component {

  constructor (props) {
    super(props);
    this._onSearch = this._onSearch.bind(this);
    this._onFilter = this._onFilter.bind(this);
    this.state = { items: [], searchText: '' };
  }

  componentDidMount () {
    document.title = this.props.title;
    this._setFilter(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this._setFilter(nextProps);
  }

  _setFilter (props) {
    let filter, filterValue;
    if (props.filter) {
      filterValue = props.location.query[props.filter.property];
      if (filterValue) {
        filter = {};
        filter[props.filter.property] = filterValue;
      }
    }
    this.setState({ filter: filter, filterValue: filterValue }, this._get);
  }

  _get () {
    const { category, populate, select, sort } = this.props;
    const { filter } = this.state;
    getItems(category, { sort, filter, select, populate })
    .then(response => this.setState({ items: response }))
    .catch(error => console.log('!!! List catch', error));
  }

  _onSearch (event) {
    const searchText = event.target.value;
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      getItems(this.props.category, {
        sort: this.props.sort,
        search: searchText,
        populate: this.props.populate
      })
      .then(response => this.setState({ items: response }))
      .catch(error => console.log('!!! List search catch', error));
    }, 100);
    this.setState({ searchText: searchText });
  }

  _onFilter (event) {
    const { filter: { property } } = this.props;
    const value = event.target.value;
    const search = (value && ! value.match(/^all$/i)) ? `?${property}=${value}` : undefined;
    this.context.router.replace({
      pathname: window.location.pathname,
      search: search
    });
  }

  render () {
    const { Item, path, title, marker, sort, session, filter,
      homer } = this.props;
    const { searchText, filterValue } = this.state;

    const descending = (sort && sort[0] === '-');
    let markerIndex = -1;
    let items = this.state.items.map((item, index) => {

      if (marker && markerIndex === -1) {
        const value = item[marker.property];
        if ((descending && value < marker.value) ||
          (! descending && value < marker.value)) {
          markerIndex = index;
        }
      }

      return (
        <li key={item._id} >
          <Item item={item} />
        </li>
      );
    });
    if (-1 !== markerIndex) {
      items.splice(markerIndex, 0, (
        <li key="marker">
          <div className="list__marker">
            {marker.label}
          </div>
        </li>
      ));
    }

    let addControl;
    if (session && session.administrator) {
      addControl = (
        <Link key="add" to={`${path}/add`} className="a-header">Add</Link>
      );
    }

    let filterAction;
    if (filter && filter.options && filter.options.length > 0) {
      filterAction = (
        <Filter key="filter" options={filter.options}
          value={filterValue}
          onChange={this._onFilter} />
      );
    }

    return (
      <main>
        <PageHeader title={title} homer={homer}
          searchText={searchText} onSearch={this._onSearch}
          actions={[filterAction, addControl]} />
        <ul className="list">
          {items}
        </ul>
      </main>
    );
  }
};

List.propTypes = {
  category: PropTypes.string,
  filter: PropTypes.shape({
    property: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired
  }),
  homer: PropTypes.bool,
  Item: PropTypes.func.isRequired,
  marker: PropTypes.shape({
    label: PropTypes.node,
    property: PropTypes.string,
    value: PropTypes.any
  }),
  path: PropTypes.string,
  select: PropTypes.string,
  session: PropTypes.shape({
    administrator: PropTypes.bool
  }),
  sort: PropTypes.string,
  title: PropTypes.string
};

List.defaultProps = {
  sort: 'name'
};

List.contextTypes = {
  router: PropTypes.any
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(List, select);
