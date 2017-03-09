import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getSearch } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Text from '../../components/Text';
import EventTimes from '../../components/EventTimes';
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

export default class Search extends Component {

  constructor() {
    super();
    this._onSearch = this._onSearch.bind(this);
    this._get = this._get.bind(this);
    this.state = { categories: {}, searchText: '' };
  }

  componentDidMount() {
    document.title = 'Search';
    const params = getLocationParams();
    if (params.q) {
      this.setState({ searchText: params.q || '' }, this._get);
    }
  }

  _get() {
    const { searchText } = this.state;
    if (searchText) {
      document.title = `Search - ${searchText}`;
      getSearch(searchText)
      .then(categories => this.setState({ categories, loading: false }))
      .catch(error => console.error('!!! Search catch', error));
    } else {
      document.title = 'Search';
      this.setState({ categories: {}, loading: false });
    }
  }

  _onSearch(event) {
    const searchText = event.target.value;
    this.setState({ searchText, loading: true });
    // debounce typing
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(this._get, 100);
    // Put the search term in the browser location
    this.context.router.replace({
      pathname: '/search',
      search: `?q=${encodeURIComponent(searchText)}`,
    });
  }

  render() {
    const { categories, loading, searchText } = this.state;

    let contents = [];
    (categories.pages || []).forEach((page) => {
      const content = page.sections.map(section => (
        <Text key={section._id}>{section.text}</Text>
      ));
      contents.push(
        <Item key={page._id} item={page}
          path={page.path || `/pages/${page._id}`}>
          {content}
        </Item>,
      );
    });

    (categories.events || []).forEach((event) => {
      contents.push(
        <Item key={event._id} item={event}
          path={`/events/${event.path || event._id}`}>
          <EventTimes event={event} />
          <Text text={event.text} />
        </Item>,
      );
    });

    (categories.libraries || []).forEach((library) => {
      contents.push(
        <Item key={library._id} item={library}
          path={`/libraries/${library.path || library._id}`} />,
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
      <main className="search-page">
        <PageHeader homer={true} responsive={false} focusOnSearch={true}
          searchText={searchText} onSearch={this._onSearch} />
        {contents}
      </main>
    );
  }
}

Search.contextTypes = {
  router: PropTypes.any,
};
