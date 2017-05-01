
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loadItem, unloadItem } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Loading from '../../components/Loading';
import MessageContents from './MessageContents';

class Message extends Component {

  componentDidMount() {
    const { dispatch, id } = this.props;
    dispatch(loadItem('messages', id, { populate: true }));
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, id, message } = nextProps;
    if (id !== this.props.id) {
      dispatch(loadItem('messages', id, { populate: true }));
    } else if (message) {
      document.title = message.name;
    }
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('messages', id));
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
  dispatch: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  message: PropTypes.object,
};

Message.defaultProps = {
  message: undefined,
};

const select = (state, props) => {
  const id = props.match.params.id;
  return {
    id,
    notFound: state.notFound[id],
    message: state[id],
    session: state.session,
  };
};

export default connect(select)(Message);
