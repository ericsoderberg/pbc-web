"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import Text from '../../components/Text';
import Image from '../../components/Image';
import Audio from '../../components/Audio';
import Video from '../../components/Video';
import Button from '../../components/Button';
import MessageItem from './MessageItem';

const LEFT_KEY = 37;
const RIGHT_KEY = 39;

export default class MessageContents extends Component {

  constructor () {
    super();
    this._onKey = this._onKey.bind(this);
  }

  componentDidMount () {
    window.addEventListener('keydown', this._onKey);
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this._onKey);
  }

  _changeToMessage (message) {
    const path = `/messages/${message.path || message._id}`;
    this.context.router.replace(path);
  }

  _onKey (event) {
    const message = this.props.item;
    const key = (event.keyCode ? event.keyCode : event.which);
    if (LEFT_KEY === key && message.previousMessage) {
      this._changeToMessage(message.previousMessage);
    } else if (RIGHT_KEY ===  key && message.nextMessage) {
      this._changeToMessage(message.nextMessage);
    }
  }

  _renderMessageNav (message, type) {
    return (
      <Button left={'previous' === type} right={'next' === type}
        path={`/messages/${message.path || message._id}`} replaceHistory={true}>
        <div className="message__nav-name">{message.name}</div>
        <div className="message__nav-verses">{message.verses}</div>
      </Button>
    );
  }

  render () {
    const message = this.props.item;

    let video;
    if (message.videoUrl) {
      video = <Video url={message.videoUrl} full={true} />;
    }

    let text;
    if (message.text) {
      text = <Text text={message.text} />;
    }

    let image;
    if (! message.videoUrl && message.image) {
      image = (
        <Image image={message.image} full={true} />
      );
    }

    let audio;
    let files = [];
    (message.files || []).forEach(file => {
      const path = `/api/files/${file._id}`;
      if (file.type) {
        if (! file.type.match(/audio/)) {
          files.push(
            <a key={file._id} className="item__container" href={path}>
              <div className="item">{file.name}</div>
            </a>
          );
        } else {
          audio = <Audio file={file} full={true} />;
        }
      }
    });
    if (files.length > 0) {
      files = (
        <div className="list">
          {files}
        </div>
      );
    }

    let seriesMessages;
    if (message.seriesMessages && message.seriesMessages.length > 0) {
      const messages = message.seriesMessages.map(message => (
        <MessageItem key={message._id} item={message} />
      ));
      seriesMessages = [
        <Text key="header" text="## Messages" />,
        <div key="list" className="list">
          {messages}
        </div>
      ];
    }

    let nextMessage;
    if (message.nextMessage) {
      nextMessage = this._renderMessageNav(message.nextMessage, 'next');
    } else {
      nextMessage = <span />;
    }

    let previousMessage;
    if (message.previousMessage) {
      previousMessage =
        this._renderMessageNav(message.previousMessage, 'previous');
    } else {
      previousMessage = <span />;
    }

    let attributes;
    if (this.props.attributes) {

      let verses;
      if (message.verses) {
        verses = [
          <dt key="t">Verses</dt>,
          <dd key="d">{message.verses}</dd>
        ];
      }

      let author;
      if (message.author) {
        author = [
          <dt key="t">Author</dt>,
          <dd key="d">{message.author}</dd>
        ];
      }

      let date;
      if (message.date) {
        // The date could be a partial string, a moment object,
        // or an ISO-8601 string
        let dateProperty = message.date;
        if (typeof dateProperty === 'string') {
          if (dateProperty.match(/.+T.+Z/)) {
            dateProperty = moment(dateProperty);
          } else {
            // match MessageFormContents
            dateProperty = moment(dateProperty, 'M/D/YYYY');
          }
        }
        if (dateProperty) {
          date = [
            <dt key="t">Date</dt>,
            <dd key="d">{dateProperty.format('MMMM Do YYYY')}</dd>
          ];
        }
      }

      let series;
      if (message.seriesId) {
        series = [
          <dt key="t">Series</dt>,
          <dd key="d">
            <Link to={`/messages/${message.seriesId._id}`}>
              {message.seriesId.name}
            </Link>
          </dd>
        ];
      }

      let library;
      if (message.libraryId) {
        library = [
          <dt key="t">Library</dt>,
          <dd key="d">
            <Link to={`/libraries/${message.libraryId._id}`}>
              {message.libraryId.name}
            </Link>
          </dd>
        ];
      }

      attributes = (
        <div className="section__container">
          <dl className="page-attributes section">
            <dt>Name</dt><dd>{message.name}</dd>
            {verses}
            {author}
            {date}
            {series}
            {library}
          </dl>
        </div>
      );
    }

    return (
      <div>
        {video}
        {audio}
        {image}
        {text}
        {files}
        {attributes}
        <div className="section__container section__container--full">
          <div className="message__nav footer">
            {previousMessage}
            {nextMessage}
          </div>
        </div>
        {seriesMessages}
      </div>
    );
  }
};

MessageContents.PropTypes = {
  attributes: PropTypes.bool,
  item: PropTypes.object.isRequired
};

MessageContents.defaultProps = {
  attributes: true
};

MessageContents.contextTypes = {
  router: PropTypes.object.isRequired
};
