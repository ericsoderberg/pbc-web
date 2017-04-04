
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { getItem } from '../../actions';
import MessageContents from './MessageContents';

export default class MessageItem extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { detailsForMostRecent, item: message } = this.props;
    const date = moment(message.date);
    const now = moment().startOf('day').subtract(1, 'minute');
    if (detailsForMostRecent && !message.series &&
      date.isBetween(moment(now).subtract(7, 'days'), now, 'day')) {
      getItem('messages', message._id)
      .then(messageResponse => this.setState({ message: messageResponse }))
      .catch(error => console.error('!!! MessageItem catch', error));
    }
  }

  render() {
    const { className, item: message } = this.props;
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
      }
      linkContents = (
        <div className="message-item__series-header">
          <span className="tertiary">Series</span>
          <h2>{message.name}</h2>
        </div>
      );
    } else {
      linkContents = [
        <div key="1">
          <div className="item__name">{message.name}</div>
          <div className="secondary">{message.verses}</div>
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
    if (this.state.message) {
      contents = (
        <div className="item--primary">
          {link}
          <MessageContents item={this.state.message} attributes={false} />
        </div>
      );
    }

    return contents;
  }
}

MessageItem.propTypes = {
  className: PropTypes.string,
  detailsForMostRecent: PropTypes.bool,
  item: PropTypes.object.isRequired,
};

MessageItem.defaultProps = {
  className: undefined,
  detailsForMostRecent: false,
};
