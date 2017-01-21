"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import MessageContents from './MessageContents';

class Message extends Component {

  componentDidMount () {
    if (! this.props.message) {
      getItem('messages', this.props.params.id, { cache: true, populate: true })
      .catch(error => console.log('!!! Message catch', error));
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.id !== this.props.params.id &&
      ! nextProps.message) {
      getItem('messages', nextProps.params.id, { cache: true, populate: true })
      .catch(error => console.log('!!! Message catch', error));
    }
    if (nextProps.message) {
      document.title = nextProps.message.name;
    }
  }

  render () {
    const { message } = this.props;
    let contents, actions;
    if (message) {
      contents = <MessageContents item={message} />;
      const library = message.libraryId || {};
      const path = `/libraries/${library.path || library._id}`;
      actions = [
        <Link key="library" to={path}>{library.name || 'Library'}</Link>
      ];
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <ItemHeader category="messages" item={message} actions={actions} />
        {contents}
      </main>
    );
  }
};

Message.propTypes = {
  message: PropTypes.object,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};

const select = (state, props) => {
  let message;
  if (state.messages) {
    message = state.messages[props.params.id];
  }
  return {
    message: message
  };
};

export default Stored(Message, select);
