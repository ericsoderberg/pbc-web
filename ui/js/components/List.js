"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItems } from '../actions';
import PageHeader from './PageHeader';
import Filter from './Filter';
import SelectSearch from './SelectSearch';
import Button from './Button';
import Stored from './Stored';
import Loading from './Loading';
import CloseIcon from '../icons/Close';

class List extends Component {

  constructor (props) {
    super(props);
    this._onSearch = this._onSearch.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._removeFilter = this._removeFilter.bind(this);
    this.state = { items: [], searchText: '' };
  }

  componentDidMount () {
    document.title = this.props.title;
    this._setStateFromLocation(this.props);
    window.addEventListener('scroll', this._onScroll);
  }

  componentWillReceiveProps (nextProps) {
    this._setStateFromLocation(nextProps);
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this._onScroll);
  }

  _setStateFromLocation (props) {
    let filter, filterNames, filterName;
    if (props.location.query.filter) {
      filter = props.location.query.filter;
      filterName = props.location.query['filter-name'];
    }
    if (props.filters) {
      filter = {};
      filterNames = {};
      props.filters.forEach(aFilter => {
        const value = props.location.query[aFilter.property];
        if (value) {
          filter[aFilter.property] = value;
          const name = props.location.query[`${aFilter.property}-name`];
          if (name) {
            filterNames[value] = name;
          }
        }
      });
    }
    const searchText = props.location.query.search || '';
    this.setState({ filter, filterName, filterNames, searchText }, this._get);
  }

  _get () {
    const { category, populate, select, sort } = this.props;
    const { filter, searchText } = this.state;
    // throttle gets when user is typing
    clearTimeout(this._getTimer);
    this._getTimer = setTimeout(() => {
      getItems(category, { sort, filter, search: searchText, select, populate })
      .then(response => this.setState({
        items: response, mightHaveMore: response.length >= 20
      }))
      .catch(error => console.log('!!! List catch', error));
    }, 100);
  }

  _setLocation (options) {
    const { filters, location } = this.props;
    const { filterNames } = this.state;
    let searchParams = [];

    const searchText = options.hasOwnProperty('searchText') ?
      options.searchText : this.state.searchText || undefined;
    if (searchText) {
      searchParams.push(`search=${encodeURIComponent(searchText)}`);
    }

    if (filters) {
      filters.forEach(filter => {
        const property = filter.property;
        let value, name;
        if (options.hasOwnProperty(property)) {
          if (typeof options[property] === 'object') {
            value = options[property]._id;
            name = options[property].name;
          } else {
            value = options[property];
          }
        } else if (this.state.filter.hasOwnProperty(property)) {
          value = this.state.filter[property];
          if (filterNames[value]) {
            name = filterNames[value];
          }
        }
        if (value) {
          searchParams.push(`${property}=${encodeURIComponent(value)}`);
          if (name) {
            searchParams.push(`${property}-name=${encodeURIComponent(name)}`);
          }
        }
      });
    }

    if (location.query.filter) {
      searchParams.push(`filter=${location.query.filter}`);
      searchParams.push(`filter-name=${location.query['filter-name']}`);
    }

    this.context.router.replace({
      pathname: window.location.pathname,
      search: `?${searchParams.join('&')}`
    });
  }

  _onMore () {
    const { category, populate, select, sort } = this.props;
    const { filter, searchText } = this.state;
    this.setState({ loadingMore: true }, () => {
      const skip = this.state.items.length;
      getItems(category, { sort, filter, search: searchText, select,
        populate, skip })
      .then(response => {
        let items = this.state.items.concat(response);
        this.setState({
          items: items,
          loadingMore: false,
          mightHaveMore: (response.length === 20)
        });
      })
      .catch(error => console.log('!!! List more catch', error));
    });
  }

  _onScroll () {
    const { mightHaveMore, loadingMore } = this.state;
    if (mightHaveMore && ! loadingMore) {
      const more = this.refs.more;
      if (more) {
        const rect = more.getBoundingClientRect();
        if (rect.top <= window.innerHeight) {
          this._onMore();
        }
      }
    }
  }

  _onSearch (event) {
    const searchText = event.target.value;
    this._setLocation({ searchText: searchText });
  }

  _filter (property) {
    return (event) => {
      let value = event.target.value;
      if (value.match(/^all$/i)) {
        value = undefined;
      }
      let options = {};
      options[property] = value;
      this._setLocation(options);
    };
  }

  _select (property) {
    return (suggestion) => {
      let options = {};
      options[property] = suggestion;
      this._setLocation(options);
    };
  }

  _removeFilter () {
    this.context.router.replace({
      pathname: window.location.pathname
    });
  }

  render () {
    const { addIfFilter, Item, path, title, marker, sort, session, filters,
      search, homer } = this.props;
    const { searchText, filter, filterName, filterNames, mightHaveMore,
      loadingMore } = this.state;

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

    let filterItems = [];
    if (filters) {
      filters.forEach(aFilter => {
        let value = (filter || {})[aFilter.property] || '';
        if (aFilter.options) {
          filterItems.push(
            <Filter key={aFilter.property} options={aFilter.options}
              value={value}
              onChange={this._filter(aFilter.property)} />
          );
        } else {
          if (value) {
            value = filterNames[value] || value;
          }
          filterItems.push(
            <SelectSearch key={aFilter.property} category={aFilter.category}
              options={{select: 'name', sort: 'name'}} clearable={true}
              placeholder={aFilter.allLabel} value={value}
              onChange={this._select(aFilter.property)} />
          );
        }
      });
    }

    if (filterName) {
      filterItems.push(
        <div key="filter" className="box--row">
          <span>{filterName}</span>
          <Button icon={<CloseIcon />} plain={true}
            onClick={this._removeFilter} />
        </div>
      );
    }

    let actions = [];
    if ((! addIfFilter || (filter || {})[addIfFilter]) && session &&
      (session.administrator || session.administratorDomainId)) {
      let addPath = `${path}/add`;
      if (addIfFilter) {
        addPath += `?${addIfFilter}=${encodeURIComponent(filter[addIfFilter])}`;
      }
      actions.push(
        <Link key="add" to={addPath} className="a-header">Add</Link>
      );
    }

    let onSearch;
    if (search) {
      onSearch = this._onSearch;
    }

    let more;
    if (loadingMore) {
      more = <Loading />;
    } else if (mightHaveMore) {
      more = <div ref="more"></div>;
    } else if (items.length > 20) {
      more = <div className="list__count">{items.length}</div>;
    }

    return (
      <main>
        <PageHeader title={title} homer={homer} focusOnSearch={true}
          searchText={searchText} onSearch={onSearch} actions={actions} />
        <div className="list__header">
          {filterItems}
        </div>
        <ul className="list">
          {items}
        </ul>
        {more}
      </main>
    );
  }
};

List.propTypes = {
  addIfFilter: PropTypes.string,
  category: PropTypes.string,
  filters: PropTypes.arrayOf(PropTypes.shape({
    allLabel: PropTypes.string.isRequired,
    category: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
      })
    ])),
    property: PropTypes.string.isRequired
  })),
  homer: PropTypes.bool,
  Item: PropTypes.func.isRequired,
  marker: PropTypes.shape({
    label: PropTypes.node,
    property: PropTypes.string,
    value: PropTypes.any
  }),
  path: PropTypes.string,
  search: PropTypes.bool,
  select: PropTypes.string,
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string
  }),
  sort: PropTypes.string,
  title: PropTypes.string
};

List.defaultProps = {
  search: true,
  sort: 'name'
};

List.contextTypes = {
  router: PropTypes.any
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(List, select);
