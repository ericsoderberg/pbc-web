"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItems } from '../actions';
import PageHeader from './PageHeader';
import Filter from './Filter';
import Stored from './Stored';
import Loading from './Loading';

class List extends Component {

  constructor (props) {
    super(props);
    this._onSearch = this._onSearch.bind(this);
    this._onFilter = this._onFilter.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this.state = { items: [], search: '' };
  }

  componentDidMount () {
    document.title = this.props.title;
    this._setFilterAndSearch(this.props);
    window.addEventListener('scroll', this._onScroll);
  }

  componentWillReceiveProps (nextProps) {
    this._setFilterAndSearch(nextProps);
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this._onScroll);
  }

  _setFilterAndSearch (props) {
    let filter, filterValue;
    if (props.filter) {
      filterValue = props.location.query[props.filter.property];
      if (filterValue) {
        filter = {};
        filter[props.filter.property] = filterValue;
      }
    }
    const search = props.location.query.search || '';
    this.setState({ filter, filterValue, search }, this._get);
  }

  _get () {
    const { category, populate, select, sort } = this.props;
    const { filter, search } = this.state;
    // throttle gets when user is typing
    clearTimeout(this._getTimer);
    this._getTimer = setTimeout(() => {
      getItems(category, { sort, filter, search, select, populate })
      .then(response => this.setState({
        items: response, mightHaveMore: response.length >= 20
      }))
      .catch(error => console.log('!!! List catch', error));
    }, 100);
  }

  _nav (options) {
    const { filter } = this.props;
    const search = options.hasOwnProperty('search') ?
      options.search : this.state.search || undefined;
    const filterValue = options.hasOwnProperty('filterValue') ?
      options.filterValue : this.state.filterValue || undefined;

    const searchParams = [];
    if (filterValue) {
      searchParams.push(`${filter.property}=${encodeURIComponent(filterValue)}`);
    }
    if (search) {
      searchParams.push(`search=${encodeURIComponent(search)}`);
    }

    this.context.router.replace({
      pathname: window.location.pathname,
      search: `?${searchParams.join('&')}`
    });
  }

  _onMore () {
    const { category, populate, select, sort } = this.props;
    const { filter, search } = this.state;
    this.setState({ loadingMore: true }, () => {
      const skip = this.state.items.length;
      getItems(category, { sort, filter, search, select, populate, skip })
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
    const search = event.target.value;
    this._nav({ search: search });
  }

  _onFilter (event) {
    let filterValue = event.target.value;
    if (filterValue.match(/^all$/i)) {
      filterValue = undefined;
    }
    this._nav({ filterValue });
  }

  render () {
    const { Item, path, title, marker, sort, session, filter,
      homer } = this.props;
    const { search, filterValue, mightHaveMore, loadingMore } = this.state;

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
    if (session && (session.administrator || session.administratorDomainId)) {
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
          searchText={search} onSearch={this._onSearch}
          actions={[filterAction, addControl]} />
        <ul className="list">
          {items}
        </ul>
        {more}
      </main>
    );
  }
};

List.propTypes = {
  category: PropTypes.string,
  filter: PropTypes.shape({
    property: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
      })
    ])).isRequired
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
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string
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
