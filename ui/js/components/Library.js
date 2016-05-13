"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { getItems } from '../actions';
import Section from './Section';
import Image from './Image';

export default class Library extends Component {

  constructor () {
    super();
    this.state = { message: {} };
  }

  componentDidMount () {
    let date = moment().subtract(1, 'day');
    getItems('messages', {
      filter: {
        library: this.props.name,
        date: { $gt: date.toString() }
      },
      limit: 1
    })
    .then(messages => this.setState({ message: messages[0] }))
    .catch(error => console.log('!!! Library catch', error));
  }

  render () {
    const { color, full, plain } = this.props;
    const { message } = this.state;

    let image;
    if (message.image) {
      image = <Image image={message.image} plain={true} />;
    }

    return (
      <Section color={color} full={full} plain={plain}>
        <div className="library">
          <Link to={`/messages/${message._id}`}>
            {image}
            <div className="library__message">
              <label>Last Week</label>
              <div className="library__message-details">
                <h2>{message.name}</h2>
                <div>{message.verses}</div>
                <div className="library__message-author">{message.author}</div>
              </div>
            </div>
          </Link>
        </div>
      </Section>
    );
  }
};

Library.propTypes = {
  name: PropTypes.string.isRequired,
  ...Section.propTypes
};
