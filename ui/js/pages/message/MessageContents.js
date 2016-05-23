"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import Text from '../../components/Text';
import Image from '../../components/Image';
import Audio from '../../components/Audio';
import Video from '../../components/Video';
import MessageItem from './MessageItem';

export default class MessageContents extends Component {

  _renderMessageNav (message, type) {
    return (
      <Link className={`message__nav-${type}`}
        to={`/messages/${message.path || message._id}`}>
        <div className="message__nav-name">{message.name}</div>
        <div className="message__nav-verses">{message.verses}</div>
      </Link>
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
    if (message.image) {
      image = <Image image={message.image} full={true} />;
    }

    let audio;
    let files = [];
    (message.files || []).forEach(file => {
      const path = `/api/files/${file._id}`;
      if (! file.type.match(/audio/)) {
        files.push(
          <a key={file._id} className="item__container" href={path}>
            <div className="item">{file.name}</div>
          </a>
        );
      } else {
        audio = <Audio file={file} full={true} />;
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

    let nextMessage;
    if (message.nextMessage) {
      nextMessage = this._renderMessageNav(message.nextMessage, 'next');
    } else {
      nextMessage = <span></span>;
    }

    let previousMessage;
    if (message.previousMessage) {
      previousMessage = this._renderMessageNav(message.previousMessage, 'previous');
    } else {
      previousMessage = <span></span>;
    }

    // The date could be a partial string, a moment object, or an ISO-8601 string
    let date = message.date;
    if (typeof date === 'string') {
      if (date.match(/.+T.+Z/)) {
        date = moment(date);
      } else {
        date = moment(date, 'M/D/YYYY'); // match MessageFormContents
      }
    }
    if (date) {
      date = date.format('MMMM Do YYYY');
    }

    return (
      <div>
        {video}
        {audio}
        {image}
        {text}
        {files}
        <div className="section__container">
          <dl className="page-attributes section">
            <dt>Name</dt><dd>{message.name}</dd>
            <dt>Verses</dt><dd>{message.verses}</dd>
            <dt>Author</dt><dd>{message.author}</dd>
            <dt>Date</dt><dd>{date}</dd>
            {series}
            <dt>Library</dt><dd>{message.library}</dd>
          </dl>
        </div>
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
  item: PropTypes.object.isRequired
};
