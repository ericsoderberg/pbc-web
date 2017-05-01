import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { loadItem, unloadItem } from '../../actions';
import { isDarkBackground } from '../../utils/Color';
import MessageContents from './MessageContents';

class MessageItem extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { details, dispatch, item: message } = this.props;
    if (details) {
      dispatch(loadItem('messages', message._id));
    }
  }

  componentWillUnmount() {
    const { dispatch, item: message } = this.props;
    dispatch(unloadItem('messages', message._id));
  }

  render() {
    const { className, details, item: message } = this.props;
    const classNames = ['item__container'];
    if (className) {
      classNames.push(className);
    }
    const date = moment(message.date);

    let linkContents;
    const style = {};
    if (message.series) {
      if (message.color) {
        style.backgroundColor = message.color;
        if (isDarkBackground(message.color)) {
          classNames.push('dark-background');
        }
      }
      linkContents = (
        <div className="message-item__series-header">
          <span className="secondary">Series</span>
          <h2>{message.name}</h2>
        </div>
      );
    } else {
      const verses = (message.name !== message.verses ? message.verses : undefined);
      linkContents = [
        <div key="1">
          <div className="item__name">{message.name}</div>
          <div className="secondary">{verses}</div>
        </div>,
        <div key="2">
          <div className="tertiary">{date.format('MMM Do YYYY')}</div>
          <div className="secondary">{message.author}</div>
        </div>,
      ];
    }

    const link = (
      <Link className={classNames.join(' ')} style={style}
        to={`/messages/${message.path || message._id}`}>
        <div className="item message-item">
          {linkContents}
        </div>
      </Link>
    );

    let contents = link;
    if (details) {
      contents = (
        <div className="item--primary">
          {link}
          <MessageContents item={message} attributes={false} />
        </div>
      );
    }

    return contents;
  }
}

MessageItem.propTypes = {
  className: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  details: PropTypes.bool,
  // detailsForMostRecent: PropTypes.bool,
  item: PropTypes.object.isRequired,
};

MessageItem.defaultProps = {
  className: undefined,
  details: false,
  detailsForMostRecent: false,
};

const select = (state, props) => {
  const message = props.item;
  const id = message._id;
  const date = moment(message.date);
  const now = moment().startOf('day').subtract(1, 'minute');
  const details = (props.detailsForMostRecent && !message.series &&
    date.isBetween(moment(now).subtract(7, 'days'), now, 'day'));
  return {
    details,
    item: state[id] || props.item,
    notFound: state.notFound[id],
    session: state.session,
  };
};

export default connect(select)(MessageItem);
