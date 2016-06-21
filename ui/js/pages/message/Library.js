"use strict";
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router';
import moment from 'moment';
import { getItems, getItem } from '../../actions';
import Section from '../../components/Section';
import Image from '../../components/Image';
import Button from '../../components/Button';

export default class Library extends Component {

  constructor (props) {
    super(props);
    this._onScroll = this._onScroll.bind(this);
    this.state = { offset: 0, message: props.message };
  }

  componentDidMount () {
    this._load(this.props);
    window.addEventListener('scroll', this._onScroll);
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.name !== nextProps.name ||
      this.props.message !== nextProps.message) {
      this._load(nextProps);
    }
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this._onScroll);
  }

  _load (props) {
    if (props.message) {
      this.setState({ message: props.message });
    } else if (props.name) {
      let date = moment().subtract(1, 'day');
      getItems('messages', {
        filter: {
          library: props.name,
          date: { $gt: date.toString() }
        },
        sort: 'date',
        limit: 1
      })
      .then(messages => {
        const message = messages[0];
        if (message && message.seriesId) {
          return getItem('messages', message.seriesId);
        } else {
          this.setState({ message: message });
          return undefined;
        }
      })
      .then(series => this.setState({ series: series }))
      .catch(error => console.log('!!! Library catch', error));
    }
  }

  _onScroll (event) {
    const elem = findDOMNode(this.refs.image);
    const rect = elem.getBoundingClientRect();
    if (rect.top < 0) {
      this.setState({ offset: Math.floor(Math.abs(rect.top) / 20) });
    }
  }

  _renderSeries (series) {
    let classNames = ['library__message'];
    let image;
    if (series.image) {
      const style = {
        top: this.state.offset,
        transform: `scale(${1 + (this.state.offset / 600)})`
      };
      image = (
        <Image ref="image" className="library__message-image"
          image={series.image} plain={true} style={style} />
      );
      classNames.push('library__message--imaged');
    }

    return (
      <Link to={`/messages/${series._id}`}>
        {image}
        <div className={classNames.join(' ')}>
          <Button right={true}>Current Series</Button>
          <h2>{series.name}</h2>
        </div>
      </Link>
    );
  }

  _renderMessage (message) {
    let classNames = ['library__message'];
    let image;
    if (message.image) {
      const style = {
        top: this.state.offset,
        transform: `scale(${1 + (this.state.offset / 600)})`
      };
      image = (
        <Image ref="image" className="library__message-image"
          image={message.image} plain={true} style={style} />
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
    const { color, full } = this.props;
    const { message, series } = this.state;
    let plain = full;

    let contents;
    if (series) {
      contents = this._renderSeries(series);
      if (! series.image) {
        plain = false;
      }
    } else if (message) {
      contents = this._renderMessage(message);
      if (! message.image) {
        plain = false;
      }
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
  message: PropTypes.object,
  name: PropTypes.string,
  ...Section.propTypes
};
