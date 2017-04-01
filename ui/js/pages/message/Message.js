
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { getItem } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import MessageContents from './MessageContents';

class Message extends Component {

  componentDidMount() {
    const { message, match } = this.props;
    if (!message) {
      getItem('messages', match.params.id, { cache: true, populate: true })
      .catch(error => console.error('!!! Message catch', error));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id &&
      !nextProps.message) {
      getItem('messages', nextProps.match.params.id,
        { cache: true, populate: true })
      .catch(error => console.error('!!! Message catch', error));
    }
    if (nextProps.message) {
      document.title = nextProps.message.name;
    }
  }

  render() {
    const { message } = this.props;
    let contents;
    let actions;
    if (message) {
      contents = <MessageContents item={message} />;
      const library = message.libraryId || {};
      const path = `/libraries/${library.path || library._id}`;
      actions = [
        <Link key="library" to={path}>Library</Link>,
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
}

Message.propTypes = {
  message: PropTypes.object,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

Message.defaultProps = {
  message: undefined,
};

const select = (state, props) => {
  let message;
  if (state.messages) {
    message = state.messages[props.match.params.id];
  }
  return {
    message,
  };
};

export default Stored(Message, select);
