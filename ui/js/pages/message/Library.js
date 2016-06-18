"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { getItems } from '../../actions';
import Section from '../../components/Section';
import Image from '../../components/Image';
import Button from '../../components/Button';

export default class Library extends Component {

  constructor (props) {
    super(props);
    this.state = {};
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this._load(nextProps);
  }

  _load (props) {
    if (props.name) {
      let date = moment().add(1, 'day');
      getItems('messages', {
        filter: {
          library: props.name,
          date: { $lt: date.toString() }
        },
        sort: '-date',
        limit: 1
      })
      .then(messages => this.setState({ message: messages[0] }))
      .catch(error => console.log('!!! Library catch', error));
    }
  }

  _renderMessage (message) {
    let classNames = ['library__message'];
    let image;
    if (message.image) {
      image = (
        <Image className="library__message-image" image={message.image}
          plain={true} />
      );
      classNames.push('library__message--imaged');
    }

    return (
      <Link to={`/messages/${message._id}`}>
        {image}
        <div className={classNames.join(' ')}>
          <Button right={true}>Latest Message</Button>
          <label>{moment(message.date).format('MMM Do')}</label>
          <h2>{message.name}</h2>
        </div>
      </Link>
    );
  }

  _renderLibrary () {
    const { name } = this.props;
    return (
      <Button path={`/messages?library=${name}`} right={true}>
        Messages
      </Button>
    );
  }

  render () {
    const { color, full, plain } = this.props;
    const { message } = this.state;

    let contents;
    if (message) {
      contents = this._renderMessage(message);
    } else {
      contents = this._renderLibrary();
    }

    return (
      <Section color={color} full={full} plain={plain}>
        <div className="library">
          {contents}
        </div>
      </Section>
    );
  }
};

Library.propTypes = {
  // library: PropTypes.object,
  name: PropTypes.string,
  ...Section.propTypes
};
