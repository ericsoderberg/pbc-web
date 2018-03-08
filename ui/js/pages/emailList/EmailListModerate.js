
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadItem, putMessage, deleteMessage, unloadItem } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import SendIcon from '../../icons/Send';
import TrashIcon from '../../icons/Trash';
import DownArrow from '../../icons/DownArrow';
import UpArrow from '../../icons/UpArrow';

class EmailList extends Component {
  constructor() {
    super();
    this._onCancel = this._onCancel.bind(this);
    this.state = { collapsed: {} } // messageUri -> true/false
  }

  componentDidMount() {
    const { dispatch, id } = this.props;
    dispatch(loadItem('email-lists', id));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.emailList) {
      document.title = `${nextProps.emailList.name} moderate`;
    }
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('email-lists', id));
  }

  _load() {
    const { dispatch, id } = this.props;
    dispatch(loadItem('email-lists', id));
  }

  _onCancel() {
    const { history } = this.props;
    history.goBack();
  }

  _isCollapsed(messageUri) {
    const collapsed = this.state.collapsed[messageUri];
    return collapsed === undefined ? true : collapsed;
  }

  _accept(messageUri) {
    return () => {
      putMessage(messageUri)
        .then(() => this._load())
        .catch(error => this.setState({ error }));
    };
  }

  _discard(messageUri) {
    return () => {
      deleteMessage(messageUri)
        .then(() => this._load())
        .catch(error => this.setState({ error }));
    };
  }

  _toggleContent(messageUri) {
    return () => {
      const collapsed = { ...this.state.collapsed };
      collapsed[messageUri] = !this._isCollapsed(messageUri);
      this.setState({ collapsed });
    };
  }

  render() {
    const { emailList, notFound } = this.props;

    let result;
    if (emailList) {

      const items = emailList.heldMessages.map((message) => {
        return (
          <div key={message.uri} className="item__container">
            <div className="item">
              <span className="item__name">{message.from}</span>
              <span className="box__connector" />
              <div className="box--row box--static box--between">
                <button type="button"
                  className="button-icon"
                  onClick={this._accept(message.uri)}>
                  <SendIcon />
                </button>
                <button type="button"
                  className="button-icon"
                  onClick={this._discard(message.uri)}>
                  <TrashIcon />
                </button>
              </div>
            </div>
            <div className="item">
              <span>{message.subject}</span>
              <span>{message.date}</span>
              <button type="button"
                className="button-icon"
                onClick={this._toggleContent(message.uri)}>
                { this._isCollapsed(message.uri) ?
                  <DownArrow />
                  :
                  <UpArrow />
                }
              </button>
            </div>
            { this._isCollapsed(message.uri) ?
              <span></span>
              :
              <div className="item">
                <textarea className="textarea-wide" rows="10" readOnly="true">
                  {message.content.body}
                </textarea>
              </div>
            }
          </div>
        );
      });

      let message;
      if (items.length === 0) {
        const text = 'No messages need moderation';
        message = <div className="list__message">{text}</div>;
      } else {
        message = <div className="list__count">{items.length}</div>;
      }

      result = (
        <main>
          <PageHeader title={`Moderate ${emailList.name}`}
            actions={[
              <button key="cancel"
                type="button"
                className="button"
                onClick={this._onCancel}>
                Cancel
              </button>,
            ]} />
          <ul className="list email-list__messages">
            {items}
          </ul>
          {message}
        </main>
      );
    } else if (notFound) {
      result = <NotFound />;
    } else {
      result = <Loading />;
    }

    return result;
  }
}

EmailList.propTypes = {
  dispatch: PropTypes.func.isRequired,
  emailList: PropTypes.object,
  history: PropTypes.any.isRequired,
  id: PropTypes.string.isRequired,
  notFound: PropTypes.bool,
};

EmailList.defaultProps = {
  emailList: undefined,
  notFound: false,
};

const select = (state, props) => {
  const { match: { params: { id } } } = props;
  return {
    id,
    notFound: state.notFound[id],
    emailList: state[id],
  };
};

export default connect(select)(EmailList);
