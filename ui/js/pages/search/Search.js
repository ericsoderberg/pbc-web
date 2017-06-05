import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loadSearch, unloadSearch } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Text from '../../components/Text';
import EventTimes from '../event/EventTimes';
import Loading from '../../components/Loading';
import { getLocationParams } from '../../utils/Params';

const Item = props => (
  <div className="search__item">
    <Link className="search__link" to={props.path}>
      {props.item.name}
    </Link>
    {props.children}
  </div>
);

Item.propTypes = {
  children: PropTypes.any,
  item: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  path: PropTypes.string.isRequired,
};

Item.defaultProps = {
  children: null,
};

class Search extends Component {

  constructor() {
    super();
    this._onSearch = this._onSearch.bind(this);
    this._load = this._load.bind(this);
    this.state = { categories: {}, searchText: '' };
  }

  componentDidMount() {
    document.title = 'Search';
    const params = getLocationParams();
    if (params.q) {
      this.setState({ searchText: params.q || '' }, this._load);
    }
  }

  componentWillReceiveProps() {
    this.setState({ loading: false });
  }

  componentDidUpdate() {
    const { searchText } = this.state;
    if (searchText) {
      document.title = `Search - ${searchText}`;
    } else {
      document.title = 'Search';
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadSearch());
  }

  _load() {
    const { dispatch } = this.props;
    const { searchText } = this.state;
    this.setState({ loading: true }, () => {
      dispatch(loadSearch(searchText));
    });
  }

  _onSearch(event) {
    const { history } = this.props;
    const searchText = event.target.value;
    this.setState({ searchText });
    // debounce typing
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(this._load, 100);
    // Put the search term in the browser location
    history.replace({
      pathname: '/search',
      search: `?q=${encodeURIComponent(searchText)}`,
    });
  }

  render() {
    const { search: categories } = this.props;
    const { loading, searchText } = this.state;

    let contents = [];
    (categories.pages || []).forEach((page) => {
      const content = page.sections.map(section => (
        <Text key={section._id}>{section.text}</Text>
      ));
      contents.push([page.score, (
        <Item key={page._id}
          item={page}
          path={page.path || `/pages/${page._id}`}>
          {content}
        </Item>
      )]);
    });

    (categories.libraries || []).forEach((library) => {
      library.name = `${library.name} Library`;
      contents.push([library.score, (
        <Item key={library._id}
          item={library}
          path={`/libraries/${library.path || library._id}`}>
          <Text text={library.text} />
        </Item>
      )]);
    });

    (categories.events || []).forEach((event) => {
      contents.push([event.score, (
        <Item key={event._id}
          item={event}
          path={`/events/${event.path || event._id}`}>
          <EventTimes event={event} />
          <Text text={event.text} />
        </Item>
      )]);
    });

    if (contents.length === 0) {
      if (loading) {
        contents = <Loading />;
      } else {
        const message = searchText ? 'No matches' : 'Awaiting your input';
        contents = <div className="search__message">{message}</div>;
      }
    } else {
      contents = contents.sort((c1, c2) => c2[0] - c1[0]).map(c => c[1]);
    }

    const actions =
      [<Link key="lib" to="/libraries/sermon">Search sermon library</Link>];

    return (
      <main className="search-page">
        <PageHeader homer={true}
          responsive={false}
          focusOnSearch={true}
          actions={actions}
          searchPlaceholder="Search pages and events"
          searchText={searchText}
          onSearch={this._onSearch} />
        {contents}
      </main>
    );
  }
}

Search.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.any.isRequired,
  search: PropTypes.shape({
    categories: PropTypes.object,
  }),
};

Search.defaultProps = {
  search: {},
};

const select = state => ({
  search: state.search || {},
  session: state.session,
});

export default connect(select)(Search);
