"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItems } from '../actions';
import PageHeader from './PageHeader';

export default class List extends Component {

  constructor (props) {
    super(props);
    this._onSearch = this._onSearch.bind(this);
    this._onFilter = this._onFilter.bind(this);
    this.state = { items: [], searchText: '' };
  }

  componentDidMount () {
    document.title = this.props.title;

    getItems(this.props.category, { sort: this.props.sort })
    .then(response => this.setState({ items: response }))
    .catch(error => console.log('!!! List catch', error));

    if (this.props.filter) {
      getItems(this.props.category, { distinct: this.props.filter })
      .then(response => this.setState({ filterValues: response }))
      .catch(error => console.log('!!! List filter catch', error));
    }
  }

  componentWillReceiveProps (nextProps) {
    const filterValue = nextProps.location.query[nextProps.filter];
    let filter;
    if (filterValue) {
      filter = {};
      filter[this.props.filter] = filterValue;
    }
    getItems(this.props.category, { sort: this.props.sort, filter: filter })
    .then(response => this.setState({ items: response }))
    .catch(error => console.log('!!! List catch', error));
  }

  _onSearch (event) {
    const searchText = event.target.value;
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      getItems(this.props.category,
        { sort: this.props.sort, search: searchText })
      .then(response => this.setState({ items: response }))
      .catch(error => console.log('!!! List search catch', error));
    }, 100);
    this.setState({ searchText: searchText });
  }

  _onFilter (event) {
    const value = event.target.value;
    this.context.router.replace({ pathname: window.location.pathname,
      query: { library: value } });
  }

  render () {
    const { filter, Item, path, title, marker, sort } = this.props;
    const { filterValues, searchText } = this.state;

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

    const addControl = (
      <Link key="add" to={`${path}/add`} className="a--header">Add</Link>
    );

    let filterControl;
    if (filter && filterValues) {
      let options = (filterValues || []).map(value => (
        <option key={value}>{value}</option>
      ));
      options.unshift(<option key="_all"></option>);
      filterControl = (
        <select key="filter" className="select--header" onChange={this._onFilter}>
          {options}
        </select>
      );
    }

    return (
      <main>
        <PageHeader title={title}
          searchText={searchText} onSearch={this._onSearch}
          actions={[filterControl, addControl]} />
        <ul className="list">
          {items}
        </ul>
      </main>
    );
  }
};

List.propTypes = {
  category: PropTypes.string,
  filter: PropTypes.string,
  Item: PropTypes.func.isRequired,
  marker: PropTypes.shape({
    label: PropTypes.node,
    property: PropTypes.string,
    value: PropTypes.any
  }),
  path: PropTypes.string,
  sort: PropTypes.string,
  title: PropTypes.string
};

List.defaultProps = {
  sort: 'name'
};

List.contextTypes = {
  router: PropTypes.any
};
