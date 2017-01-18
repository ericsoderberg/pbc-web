"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItems } from '../actions';
import PageHeader from './PageHeader';
import Filter from './Filter';
import SelectSearch from './SelectSearch';
import Stored from './Stored';
import Loading from './Loading';

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
    let filter, filterNames;
    if (props.location.query.filter) {
      filter = props.location.query.filter;
    } else if (props.filter) {
      filter = props.filter;
    } else if (props.filters) {
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
    this.setState({ filter, filterNames, searchText }, this._get);
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

    if (location.query.filter) {
      searchParams.push(`filter=${location.query.filter}`);
    } else if (filters) {
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
    const {
      addIfFilter, back, Item, path, title, marker, sort, session,
      filters, search, homer
    } = this.props;
    let { actions } = this.props;
    const {
      searchText, filter, filterNames, mightHaveMore, loadingMore
    } = this.state;

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
              allLabel={aFilter.allLabel} value={value}
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

    if ((! addIfFilter || (filter || {})[addIfFilter]) && session &&
      (session.administrator || session.administratorDomainId)) {
      let addPath = `${path}/add`;
      if (addIfFilter) {
        addPath += `?${addIfFilter}=${encodeURIComponent(filter[addIfFilter])}`;
      }
      actions = [ ...actions,
        <Link key="add" to={addPath}>Add</Link>
      ];
    }

    let onSearch;
    if (search) {
      onSearch = this._onSearch;
    }

    let more;
    if (loadingMore) {
      more = <Loading />;
    } else if (mightHaveMore) {
      more = <div ref="more" />;
    } else if (items.length > 20) {
      more = <div className="list__count">{items.length}</div>;
    }

    return (
      <main>
        <PageHeader title={title} homer={homer} back={back}
          focusOnSearch={false}
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
  actions: PropTypes.arrayOf(PropTypes.element),
  addIfFilter: PropTypes.string,
  back: PropTypes.bool,
  category: PropTypes.string,
  filter: PropTypes.object,
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
  actions: [],
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
