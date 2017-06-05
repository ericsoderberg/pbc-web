
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import { loadItem, unloadItem, loadCategory, unloadCategory } from '../../actions';
import RightIcon from '../../icons/Right';
import MessageItem from '../message/MessageItem';

class LibrarySection extends Component {

  constructor(props) {
    super(props);
    this.state = {
      library: (typeof props.id === 'string' ? props.id : {}),
      message: props.message,
    };
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.id !== nextProps.id ||
      this.props.message !== nextProps.message) {
      this._load(nextProps);
    }
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('libraries', id));
    dispatch(unloadCategory('messages'));
  }

  _load(props) {
    const { dispatch, id, library, message } = props;
    if (id) {
      if (!library) {
        dispatch(loadItem('libraries', props.id));
      } else if (!message) {
        const date = moment().add(1, 'day');
        dispatch(loadCategory('messages', {
          filter: {
            libraryId: id,
            date: { $lt: date.toString() },
          },
          sort: '-date',
          limit: 1,
        }));
      }
    }
  }

  render() {
    const { className, library, message } = this.props;

    const classes = ['library-summary'];
    if (className) {
      classes.push(className);
    }

    let messageItem;
    let seriesItem;
    if (message) {
      if (message.message) {
        messageItem = <MessageItem item={message.message} />;
        seriesItem = <MessageItem item={message.series} />;
      } else {
        messageItem = <MessageItem item={message} />;
      }
    }

    return (
      <div className={classes.join(' ')}>
        <div className="library-summary__library">
          <Link to={`/libraries/${library.path || library._id}`}>
            <h2>{library.name} Library</h2>
            <RightIcon className="anchor__indicator" />
          </Link>
        </div>
        <div className="library-summary__message">
          {messageItem}
        </div>
        <div className="library-summary__message">
          {seriesItem}
        </div>
      </div>
    );
  }
}

LibrarySection.propTypes = {
  className: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  library: PropTypes.object,
  message: PropTypes.object,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

LibrarySection.defaultProps = {
  className: undefined,
  library: {},
  message: undefined,
  id: undefined,
};

const select = (state, props) => {
  let id;
  let library;
  let notFound;
  let message = props.message;
  if (props.id) {
    if (typeof props.id === 'object') {
      id = props.id._id;
      library = props.id;
    } else {
      id = props.id;
      library = props.library || state[id];
      notFound = state.notFound[id];
    }
    if (!message && state.messages) {
      message = state.messages.items[0];
    }
  }
  return {
    id,
    library,
    message,
    notFound,
  };
};

export default connect(select)(LibrarySection);
