"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
// import moment from 'moment';
import { getItem, getItems } from '../../actions';
import List from '../../components/List';
import Loading from '../../components/Loading';
import MessageItem from '../message/MessageItem';
import Stored from '../../components/Stored';
// import UpIcon from '../../icons/Up';
// import DownIcon from '../../icons/Down';

class LibraryMessageItem extends MessageItem {};
LibraryMessageItem.defaultProps = {
  detailsForMostRecent: true
};

class Library extends Component {

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
      getItems('pages', {
        filter: { 'sections.libraryId': library._id },
        select: 'name'
      })
      .then(pages => this.setState({ pages: pages }))
      .catch(error => console.log('!!! Library pages catch', error));
    })
    .catch(error => console.log('!!! Library catch', error));
  }

  render () {
    const { location, session } = this.props;
    const { library, pages } = this.state;

    let result;
    if (! library) {
      result = <Loading />;
    } else {

      // const marker = {
      //   property: 'date',
      //   value: moment().startOf('day').toISOString(),
      //   label: (
      //     <div className="marker">
      //       <span>future <UpIcon /></span><span>past <DownIcon /></span>
      //     </div>
      //   )
      // };

      const controls = (pages || []).map(page => (
        <Link key={page.name} to={page.path || `/pages/${page._id}`}>
          {page.name}
        </Link>
      ));
      if (session && (session.administrator ||
        session.administratorDomainId === page.domainId)) {
        controls.push(
          <Link key='edit' to={`/libraries/${library._id}/edit`}>
            Edit
          </Link>
        );
      }

      result = (
        <List location={location} homer={true}
          category="messages" title={`${library.name} Library`} path="/messages"
          filter={{ libraryId: library._id }}
          select="name path verses date author series" sort="-date"
          Item={LibraryMessageItem}
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
  }),
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string
  })
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(Library, select);
