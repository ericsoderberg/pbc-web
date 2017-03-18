
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import Text from '../../components/Text';
import Image from '../../components/Image';
import Audio from '../../components/Audio';
import Video from '../../components/Video';
import Button from '../../components/Button';
import Section from '../../components/Section';
import RightIcon from '../../icons/Right';
import MessageItem from './MessageItem';

const LEFT_KEY = 37;
const RIGHT_KEY = 39;

export default class MessageContents extends Component {

  constructor() {
    super();
    this._onKey = this._onKey.bind(this);
  }

  componentDidMount() {
    window.addEventListener('keydown', this._onKey);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this._onKey);
  }

  _changeToMessage(message) {
    const path = `/messages/${message.path || message._id}`;
    this.context.router.replace(path);
  }

  _onKey(event) {
    const { item: message } = this.props;
    const key = (event.keyCode ? event.keyCode : event.which);
    if (LEFT_KEY === key && message.previousMessage) {
      this._changeToMessage(message.previousMessage);
    } else if (RIGHT_KEY === key && message.nextMessage) {
      this._changeToMessage(message.nextMessage);
    }
  }

  _renderMessageNav(message, type) {
    return (
      <Button left={type === 'previous'} right={type === 'next'}
        path={`/messages/${message.path || message._id}`} replaceHistory={true}>
        <div className="message__nav-name">{message.name}</div>
        <div className="message__nav-verses">{message.verses}</div>
      </Button>
    );
  }

  render() {
    const message = this.props.item;

    let seriesMessages;
    let align = 'start'; // 'center';
    if (message.seriesMessages && message.seriesMessages.length > 0) {
      const messages = message.seriesMessages.map(seriesMessage => (
        <MessageItem key={seriesMessage._id} item={seriesMessage} />
      ));
      seriesMessages = [
        <div key="list" className="list">
          {messages}
        </div>,
      ];
      align = 'start';
    }

    let upcoming;
    if (!message.series && moment(message.date).isAfter(moment())) {
      upcoming = <span> - upcoming</span>;
    }

    let video;
    if (message.videoUrl) {
      video = <Video url={message.videoUrl} full={true} />;
    }

    let text;
    if (message.text) {
      text = (
        <Section full={false} align={align}>
          <Text text={message.text} />
        </Section>
      );
    }

    let image;
    if (!message.videoUrl && message.image) {
      image = (
        <Image image={message.image} full={true} />
      );
    }

    let audio;
    let files = [];
    (message.files || []).forEach((file) => {
      const path = `/api/files/${file._id}`;
      if (file.type) {
        if (file.type.match(/audio/)) {
          audio = <Audio file={file} full={false} />;
        } else {
          files.push(
            <a key={file._id} className="item__container" href={path}>
              <div className={`item item--${align}`}>
                <span className="files-section__file-name">
                  {file.label || file.name}
                  <RightIcon className="anchor__indicator" />
                </span>
              </div>
            </a>,
          );
        }
      }
    });
    if (files.length > 0) {
      files = (
        <Section full={true} align={align}>
          <div className="list">
            {files}
          </div>
        </Section>
      );
    }

    let footer;
    if (message.nextMessage || message.previousMessage) {
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

      footer = (
        <Section full={true}>
          <div className="message__nav footer">
            {previousMessage}
            {nextMessage}
          </div>
        </Section>
      );
    }

    let attributes;
    if (this.props.attributes) {
      let series;
      if (message.seriesId) {
        series = [
          <dt key="t">Series</dt>,
          <dd key="d">
            <Link to={`/messages/${message.seriesId._id}`}>
              {message.seriesId.name}
            </Link>
          </dd>,
        ];
      }

      attributes = (
        <Section align={align}>
          <dl className="page-attributes section">
            {series}
          </dl>
        </Section>
      );
    }

    return (
      <div>
        {video || image}
        <Section align={align}>
          <div className="message__header">
            <h1>{message.name}</h1>
            <div className="secondary">{message.verses}</div>
            <div className="tertiary">
              {moment(message.date).format('MMM Do YYYY')}
              {upcoming}
            </div>
            <div className="secondary">{message.author}</div>
          </div>
        </Section>

        {audio}
        {!video ? null : image}
        {text}
        {seriesMessages}
        {files}
        {attributes}
        {footer}
      </div>
    );
  }
}

MessageContents.propTypes = {
  attributes: PropTypes.bool,
  item: PropTypes.object.isRequired,
};

MessageContents.defaultProps = {
  attributes: true,
};

MessageContents.contextTypes = {
  router: PropTypes.object.isRequired,
};
