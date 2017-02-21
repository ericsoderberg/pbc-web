"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { getItem } from '../../actions';
import MessageContents from './MessageContents';

export default class MessageItem extends Component {

  constructor (props) {
    super(props);
    this.state = {};
  }

  componentDidMount () {
    const { detailsForMostRecent, item: message } = this.props;
    const date = moment(message.date);
    const now = moment().startOf('day').subtract(1, 'minute');
    if (detailsForMostRecent && ! message.series &&
      date.isBetween(moment(now).subtract(7, 'days'), now, 'day')) {
      getItem('messages', message._id)
      .then(message => this.setState({ message: message }))
      .catch(error => console.log('!!! MessageItem catch', error));
    }
  }

  render () {
    const { item: message } = this.props;
    let classNames = ['item__container'];
    if (this.props.className) {
      classNames.push(this.props.className);
    }
    const date = moment(message.date);

    let linkContents;
    if (message.series) {
      linkContents = (
        <div className="message-item__series-header">
          <label className='tertiary'>Series</label>
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
        </div>
      ];
    }

    const link = (
      <Link className={classNames.join(' ')}
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
};

MessageItem.propTypes = {
  detailsForMostRecent: PropTypes.bool,
  item: PropTypes.object.isRequired
};

MessageItem.defaultProps = {
  detailsForMostRecent: false
};
