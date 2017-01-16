"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { getItem } from '../../actions';
import List from '../../components/List';
import Loading from '../../components/Loading';
import MessageItem from '../message/MessageItem';

class LibraryMessageItem extends MessageItem {};
LibraryMessageItem.defaultProps = {
  detailsForMostRecent: true
};

export default class Library extends Component {

  constructor () {
    super();
    this.state = {};
  }

  componentDidMount () {
    this._loadLibrary();
  }

  _loadLibrary () {
    const { params: { id } } = this.props;
    getItem('libraries', id)
    .then(library => {
      this.setState({ library: library });
    })
    .catch(error => console.log('!!! Library catch', error));
  }

  render () {
    const { location } = this.props;
    const { library } = this.state;

    let result;
    if (! library) {
      result = <Loading />;
    } else {

      const marker = {
        property: 'date',
        value: moment().startOf('day').toISOString(),
        label: (
          <div className="marker">
            <span>Today</span><span>{moment().format('MMM Do YYYY')}</span>
          </div>
        )
      };

      const controls = [
        <Link key='edit' to={`/libraries/${library._id}/edit`}>
          Edit
        </Link>
      ];

      result = (
        <List location={location}
          category="messages" title={library.name} path="/messages"
          filter={{ libraryId: library._id }}
          select="name path verses date" sort="-date"
          Item={LibraryMessageItem} marker={marker}
          addIfFilter="libraryId" actions={controls} />
      );
    }
    return result;
  }
};

Library.propTypes = {
  location: PropTypes.object,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  })
};
