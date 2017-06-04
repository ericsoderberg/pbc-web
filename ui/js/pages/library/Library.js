
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loadCategory, loadItem, unloadCategory, unloadItem } from '../../actions';
import List from '../../components/List';
import Loading from '../../components/Loading';
import MessageItem from '../message/MessageItem';

class LibraryMessageItem extends MessageItem {}

LibraryMessageItem.defaultProps = {
  detailsForMostRecent: true,
};

class Library extends Component {

  componentDidMount() {
    const { library } = this.props;
    if (!library) {
      this._load(this.props);
    } else {
      document.title = library.name;
    }
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = nextProps;
    if (nextProps.id !== this.props.id && !nextProps.library) {
      this._load(nextProps);
    }
    if (nextProps.library) {
      document.title = nextProps.library.name;

      // need real id, not path from library
      if (!nextProps.pages) {
        dispatch(loadCategory('pages', {
          filter: { 'sections.libraryId': nextProps.library.id },
          select: 'name',
        }));
      }
    }
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('libraries', id));
    dispatch(unloadCategory('pages'));
  }

  _load(props) {
    const { dispatch, id } = props;
    dispatch(loadItem('libraries', id, { populate: true }));
  }

  render() {
    const { history, library, location, pages, session } = this.props;

    let result;
    if (!library) {
      result = <Loading />;
    } else {
      const controls = pages.map(page => (
        <Link key={page.name} to={page.path || `/pages/${page._id}`}>
          {page.name}
        </Link>
      ));
      if (session && (session.userId.administrator ||
        (session.userId.administratorDomainId &&
        session.userId.administratorDomainId === library.domainId))) {
        controls.push(
          <Link key="edit" to={`/libraries/${library._id}/edit`}>
            Edit
          </Link>,
        );
      }

      const filter = {
        property: 'author',
        options: library.authors,
        allLabel: 'All authors',
      };

      result = (
        <List location={location}
          homer={true}
          adminiable={false}
          category="messages"
          title={`${library.name} Library`}
          path="/messages"
          filter={{ libraryId: library._id }}
          filters={[filter]}
          select="name path verses date author series color"
          sort="-date"
          Item={LibraryMessageItem}
          addIfFilter="libraryId"
          actions={controls}
          history={history} />
      );
    }
    return result;
  }
}

Library.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.any.isRequired,
  id: PropTypes.string.isRequired,
  library: PropTypes.object,
  location: PropTypes.object.isRequired,
  pages: PropTypes.array,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
    }),
  }),
};

Library.defaultProps = {
  library: undefined,
  pages: [],
  session: undefined,
};

const select = (state, props) => {
  const id = props.match.params.id;
  return {
    id,
    library: state[id],
    pages: state.pages,
    session: state.session,
  };
};

export default connect(select)(Library);
