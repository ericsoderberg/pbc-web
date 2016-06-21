"use strict";
import React, { Component, PropTypes } from 'react';
import { getMessage } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import MessageContents from './MessageContents';

class Message extends Component {

  componentDidMount () {
    if (! this.props.message) {
      getMessage(this.props.params.id)
      .catch(error => console.log('!!! Message catch', error));
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.id !== this.props.params.id &&
      ! nextProps.message) {
      getMessage(nextProps.params.id)
      .catch(error => console.log('!!! Message catch', error));
    }
  }

  render () {
    const { message } = this.props;
    let contents;
    if (message) {
      contents = <MessageContents item={message} />;
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <ItemHeader category="messages" item={message} />
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
