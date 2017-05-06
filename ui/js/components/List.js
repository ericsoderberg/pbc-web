import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../actions';
import { searchToObject } from '../utils/Params';
import PageHeader from './PageHeader';
import Filter from './Filter';
import SelectSearch from './SelectSearch';
import Loading from './Loading';

const UNSET = '$unset';

class List extends Component {

  constructor(props) {
    super(props);
    this._load = this._load.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._removeFilter = this._removeFilter.bind(this);
    this.state = { searchText: '' };
  }

  componentDidMount() {
    document.title = this.props.title;
    this.setState(this._stateFromProps(this.props), this._load);
    window.addEventListener('scroll', this._onScroll);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ loading: false, loadingMore: false });
    if (nextProps.location.search !== this.props.location.search) {
      this.setState(this._stateFromProps(nextProps), this._load);
    }
  }

  componentDidUpdate() {
    this._onScroll();
  }

  componentWillUnmount() {
    const { category, dispatch } = this.props;
    dispatch(unloadCategory(category));
    window.removeEventListener('scroll', this._onScroll);
  }

  _stateFromProps(props) {
    const { location } = props;
    const query = searchToObject(location.search);
    let filter;
    let filterNames;
    if (query.filter) {
      filter = query.filter;
    } else if (props.filter) {
      filter = props.filter;
    } else if (props.filters) {
      filter = {};
      filterNames = {};
      props.filters.forEach((aFilter) => {
        const value = query[aFilter.property];
        if (value) {
          filter[aFilter.property] = value;
          const name = query[`${aFilter.property}-name`];
          if (name) {
            filterNames[value] = name;
          }
        }
      });
    }
    const searchText = query.search || '';
    return { filter, filterNames, searchText };
  }

  _load() {
    const { adminable, category, dispatch, populate, select, sort } = this.props;
    const { filter, searchText } = this.state;
    this.setState({ loading: true }, () =>
      dispatch(loadCategory(category,
        { sort, filter, search: searchText, select, populate, adminable })));
  }

  _throttleLoad() {
    // throttle when user is typing
    clearTimeout(this._getTimer);
    this._getTimer = setTimeout(this._load, 100);
  }

  _setLocation(options) {
    const { filters, history, location } = this.props;
    const { filterNames } = this.state;
    const query = searchToObject(location.search);
    const searchParams = [];

    const searchText = options.searchText !== undefined ? options.searchText :
      (this.state.searchText !== undefined ? this.state.searchText : undefined);
    if (searchText) {
      searchParams.push(`search=${encodeURIComponent(searchText)}`);
    }

    if (query.filter) {
      searchParams.push(`filter=${query.filter}`);
    } else if (filters) {
      filters.forEach((filter) => {
        const property = filter.property;
        let value;
        let name;
        if (options[property]) {
          if (options[property] !== UNSET) {
            if (typeof options[property] === 'object') {
              value = options[property]._id;
              name = options[property].name;
            } else {
              value = options[property];
            }
          }
        } else if (this.state.filter[property]) {
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

    history.replace({
      pathname: window.location.pathname,
      search: `?${searchParams.join('&')}`,
    });
  }

  _onMore() {
    const { category, dispatch, items, populate, select, sort } = this.props;
    const { filter, searchText } = this.state;
    this.setState({ loadingMore: true }, () => {
      dispatch(loadCategory(category, {
        sort, filter, search: searchText, select, populate, skip: items.length,
      }));
    });
  }

  _onScroll() {
    const { mightHaveMore } = this.props;
    const { loadingMore } = this.state;
    if (mightHaveMore && !loadingMore) {
      const more = this._moreRef;
      if (more) {
        const rect = more.getBoundingClientRect();
        if (rect.top <= window.innerHeight) {
          this._onMore();
        }
      }
    }
  }

  _onSearch(event) {
    const searchText = event.target.value;
    this.setState({ searchText });
    // throttle when user is typing
    clearTimeout(this._getTimer);
    this._getTimer = setTimeout(() => this._setLocation({ searchText }), 100);
  }

  _filter(property) {
    return (event) => {
      let value = event.target.value;
      if (value.match(/^all$/i)) {
        value = UNSET;
      }
      const options = {};
      options[property] = value;
      this._setLocation(options);
    };
  }

  _select(property) {
    return (suggestion) => {
      const options = {};
      options[property] = suggestion || UNSET;
      this._setLocation(options);
    };
  }

  _removeFilter() {
    const { history } = this.props;
    history.replace({
      pathname: window.location.pathname,
    });
  }

  render() {
    const {
      addIfFilter, back, Item, items, path, title, marker, mightHaveMore,
      sort, session, filters, search, homer,
    } = this.props;
    let { actions } = this.props;
    const { searchText, filter, filterNames, loading, loadingMore } = this.state;

    const descending = (sort && sort[0] === '-');
    let markerIndex = -1;
    const contents = (items || []).map((item, index) => {
      if (marker && markerIndex === -1) {
        const value = item[marker.property];
        if ((descending && value < marker.value) ||
          (!descending && value < marker.value)) {
          markerIndex = index;
        }
      }

      return (
        <li key={item._id}>
          <Item item={item} />
        </li>
      );
    });

    if (markerIndex !== -1) {
      contents.splice(markerIndex, 0, (
        <li key="marker">
          <div className="list__marker">
            {marker.label}
          </div>
        </li>
      ));
    }

    const filterItems = [];
    if (filters) {
      filters.forEach((aFilter) => {
        let value = (filter || {})[aFilter.property] || '';
        if (aFilter.options) {
          filterItems.push(
            <Filter key={aFilter.property} options={aFilter.options}
              allLabel={aFilter.allLabel} value={value}
              onChange={this._filter(aFilter.property)} />,
          );
        } else {
          if (value) {
            value = filterNames[value] || value;
          }
          filterItems.push(
            <SelectSearch key={aFilter.property} category={aFilter.category}
              options={{ select: 'name', sort: 'name' }} clearable={true}
              placeholder={aFilter.allLabel} value={value}
              onChange={this._select(aFilter.property)} />,
          );
        }
      });
    }

    if ((!addIfFilter || (filter || {})[addIfFilter]) && session &&
      (session.userId.administrator || session.userId.administratorDomainId)) {
      let addPath = `${path}/add`;
      if (addIfFilter) {
        addPath += `?${addIfFilter}=${encodeURIComponent(filter[addIfFilter])}`;
      }
      actions = [...actions,
        <Link key="add" to={addPath}>Add</Link>,
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
      more = <div ref={(ref) => { this._moreRef = ref; }} />;
    } else if (items && items.length > 20) {
      more = <div className="list__count">{items.length}</div>;
    }

    let message;
    if (!items) {
      message = <Loading />;
    } else if (items.length === 0) {
      if (loading) {
        message = <Loading />;
      } else {
        const text = searchText ? 'No matches' : 'Awaiting your input';
        message = <div className="list__message">{text}</div>;
      }
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
          {contents}
        </ul>
        {message}
        {more}
      </main>
    );
  }
}

List.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.element),
  addIfFilter: PropTypes.string,
  adminable: PropTypes.bool,
  back: PropTypes.bool,
  category: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(PropTypes.shape({
    allLabel: PropTypes.string.isRequired,
    category: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      }),
    ])),
    property: PropTypes.string.isRequired,
  })),
  history: PropTypes.any.isRequired,
  homer: PropTypes.bool,
  Item: PropTypes.func.isRequired,
  items: PropTypes.array,
  location: PropTypes.object.isRequired,
  marker: PropTypes.shape({
    label: PropTypes.node,
    property: PropTypes.string,
    value: PropTypes.any,
  }),
  mightHaveMore: PropTypes.bool,
  path: PropTypes.string.isRequired,
  populate: PropTypes.any,
  search: PropTypes.bool,
  select: PropTypes.string,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
    }),
  }),
  sort: PropTypes.string,
  title: PropTypes.string.isRequired,
};

List.defaultProps = {
  actions: [],
  addIfFilter: undefined,
  adminable: true,
  back: false,
  filters: undefined,
  homer: false,
  items: undefined,
  marker: undefined,
  mightHaveMore: false,
  populate: undefined,
  search: true,
  select: undefined,
  session: undefined,
  sort: 'name',
};

const select = (state, props) => {
  const categoryState = state[props.category] || {};
  return {
    items: categoryState.items,
    mightHaveMore: categoryState.mightHaveMore,
    session: state.session,
  };
};

export default connect(select)(List);
