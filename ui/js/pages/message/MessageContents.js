"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItems, getItem } from '../../actions';
import moment from 'moment';
import Text from '../../components/Text';
import Image from '../../components/Image';
import MessageItem from './MessageItem';

export default class MessageContents extends Component {

  constructor () {
    super();
    this.state = {};
  }

  componentDidMount () {
    this._loadSeriesMessages(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.item._id !== nextProps.item._id) {
      this._loadSeriesMessages(nextProps);
    }
  }

  _loadSeriesMessages (props) {
    const message = props.item;
    if (message.series) {
      getItems('messages', { query: { seriesId: message._id } })
      .then(seriesMessages => this.setState({ seriesMessages: seriesMessages }))
      .catch(error => console.log('!!! MessageContents messages catch', error));
    } else {
      this.setState({ seriesMessages: undefined });
    }
    if (message.seriesId) {
      getItem('messages', message.seriesId)
      .then(series => this.setState({ series: series }))
      .catch(error => console.log('!!! MessageContents series catch', error));
    } else {
      this.setState({ series: undefined });
    }
  }

  render () {
    const message = this.props.item;

    let video;
    if (message.videoUrl) {
      // TOOD: Handle YouTube vs. Vimeo
      const regexp = /vimeo\.com\/(\d+)/;
      const match = message.videoUrl.match(regexp);
      if (match) {
        video = (
          <div className="video__container">
            <iframe className="video vimeo-player" type="text/html" width="960" height="540"
              src={`https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0`}
              frameBorder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen>
            </iframe>
          </div>
        );
      }
    }

    let text;
    if (message.text) {
      text = <Text text={message.text} />;
    }

    let image;
    if (message.image) {
      image = <Image image={message.image} full={true} />;
    }

    let seriesMessages;
    if (this.state.seriesMessages) {
      const messages = this.state.seriesMessages.map(message => (
        <MessageItem key={message._id} item={message} />
      ));
      seriesMessages = [
        <Text key="header" text="## Messages" />,
        <div key="list" className="list">
          {messages}
        </div>
      ];
    }

    let series;
    if (this.state.series) {
      const seriesMessage = this.state.series;
      series = [
        <dt key="t">Series</dt>,
        <dd key="d">
          <Link to={`/messages/${seriesMessage._id}`}>{seriesMessage.name}</Link>
        </dd>
      ];
    }

    return (
      <div>
        {video}
        {image}
        {text}
        <div className="text-container">
          <dl className="page-attributes">
            <dt>Verses</dt><dd>{message.verses}</dd>
            <dt>Author</dt><dd>{message.author}</dd>
            <dt>Date</dt><dd>{moment(message.date).format('MMMM Do YYYY')}</dd>
            {series}
          </dl>
        </div>
        {seriesMessages}
      </div>
    );
  }
};

MessageContents.PropTypes = {
  item: PropTypes.object.isRequired
};

export default MessageContents;
