"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { getItems, getItem } from '../../actions';
import RightIcon from '../../icons/Right';
import MessageItem from '../message/MessageItem';

export default class LibrarySection extends Component {

  constructor (props) {
    super(props);
    this.state = {
      library: (typeof props.id === 'string' ? props.id : {}),
      message: props.message
    };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.id !== nextProps.id ||
      this.props.message !== nextProps.message) {
      this._load(nextProps);
    }
  }

  _load (props) {
    let libraryId;
    if (props.id) {
      if (typeof props.id === 'object') {
        libraryId = props.id._id;
        this.setState({ library: props.id });
      } else {
        libraryId = props.id;
        getItem('libraries', props.id)
        .then(library => this.setState({ library: library }))
        .catch(error => console.log('!!! LibrarySummary library catch', error));
      }
    }

    if (props.message) {
      this.setState({ message: props.message });
    } else if (libraryId) {

      let date = moment().add(1, 'day');
      getItems('messages', {
        filter: {
          libraryId: libraryId,
          date: { $lt: date.toString() }
        },
        sort: '-date',
        limit: 1
      })
      .then(messages => {
        const message = messages[0];
        // if (message && message.seriesId) {
        //   return getItem('messages', message.seriesId);
        // } else {
        this.setState({ message: message });
        //   return undefined;
        // }
      })
      // .then(series => this.setState({ series: series }))
      .catch(error => console.log('!!! LibrarySummary messages catch', error));
    }
  }

  render () {
    const { className } = this.props;
    const { library, message } = this.state;

    let classes = ['library-summary'];
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
            <h2>{library.name} Library</h2><RightIcon />
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
};

LibrarySection.propTypes = {
  message: PropTypes.object,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};
