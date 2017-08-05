
import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

const BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther',
  'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

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

      const filters = [
        {
          property: 'verses',
          options: BOOKS,
          allLabel: 'All books',
        },
        {
          property: 'author',
          options: library.authors,
          allLabel: 'All authors',
        },
      ];

      result = (
        <List location={location}
          homer={true}
          adminiable={false}
          category="messages"
          title={`${library.name} Library`}
          path="/messages"
          filter={{ libraryId: library._id }}
          filters={filters}
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
