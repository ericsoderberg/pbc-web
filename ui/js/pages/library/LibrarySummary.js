"use strict";
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router';
import moment from 'moment';
import { getItems, getItem } from '../../actions';
import Image from '../../components/Image';
import Button from '../../components/Button';

export default class LibrarySummary extends Component {

  constructor (props) {
    super(props);
    this._onScroll = this._onScroll.bind(this);
    this.state = {
      offset: 0,
      library: (typeof props.id === 'string' ? props.id : {}),
      message: props.message
    };
  }

  componentDidMount () {
    this._load(this.props);
    window.addEventListener('scroll', this._onScroll);
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.id !== nextProps.id ||
      this.props.message !== nextProps.message) {
      this._load(nextProps);
    }
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this._onScroll);
  }

  _load (props) {
    let libraryId;
    if (props.id) {
      if (typeof props.id === 'object') {
        libraryId = props.id._id;
        this.setState({ library: props.id });
      } else {
        libraryId = props.id;
        getItem('libraries', props.id)
        .then(library => this.setState({ library: library }))
        .catch(error => console.log('!!! LibrarySummary library catch', error));
      }
    }

    if (props.message) {
      this.setState({ message: props.message });
    } else if (libraryId) {

      let date = moment().add(1, 'day');
      getItems('messages', {
        filter: {
          libraryId: libraryId,
          date: { $lt: date.toString() }
        },
        sort: '-date',
        limit: 1
      })
      .then(messages => {
        const message = messages[0];
        // if (message && message.seriesId) {
        //   return getItem('messages', message.seriesId);
        // } else {
        this.setState({ message: message });
        //   return undefined;
        // }
      })
      // .then(series => this.setState({ series: series }))
      .catch(error => console.log('!!! LibrarySummary messages catch', error));
    }
  }

  _onScroll (event) {
    const elem = findDOMNode(this.refs.image);
    if (elem) { // might not have an image
      const rect = elem.getBoundingClientRect();
      if (rect.top < 0) {
        this.setState({ offset: Math.floor(Math.abs(rect.top) / 20) });
      }
    }
  }

  _renderSeries (series) {
    let classNames = ['library-summary__message'];
    let image;
    if (series.image) {
      const style = {
        top: this.state.offset,
        transform: `scale(${1 + (this.state.offset / 600)})`
      };
      image = (
        <Image ref="image" className="library-summary__message-image"
          image={series.image} style={style} />
      );
      classNames.push('library-summary__message--imaged');
    }

    return (
      <Link to={`/messages/${series.path || series._id}`}>
        {image}
        <div className={classNames.join(' ')}>
          <Button right={true}>Current Series</Button>
          <h2>{series.name}</h2>
        </div>
      </Link>
    );
  }

  _renderMessage (message) {
    // let classNames = ['library-summary__message'];
    // let image;
    // if (message.image) {
    //   const style = {
    //     top: this.state.offset,
    //     transform: `scale(${1 + (this.state.offset / 600)})`
    //   };
    //   image = (
    //     <Image ref="image" className="library-summary__message-image"
    //       image={message.image} style={style} />
    //   );
    //   classNames.push('library-summary__message--imaged');
    // }

    return (
      <Link to={`/messages/${message.path || message._id}`}>
        <label>Latest Message</label>
        <h2>{message.name}</h2>
        <span>{moment(message.date).format('MMMM Do')}</span>
      </Link>
    );
  }

  _renderLibrary (library) {
    return (
      <Button path={`/libraries/${library.path || library._id}`} right={true}>
        Messages
      </Button>
    );
  }

  render () {
    const { className } = this.props;
    const { library, message } = this.state;

    let classes = ['library-summary'];
    if (className) {
      classes.push(className);
    }

    let contents;
    if (message) {
      if (message.series) {
        contents = this._renderSeries(message);
      } else {
        contents = this._renderMessage(message);
      }
    }

    return (
      <div className={classes.join(' ')}>
        <div className="library-summary__library">
          <Button
            path={`/libraries/${library.path || library._id}`} right={true}>
            {library.name}
          </Button>
        </div>
        <div className="library-summary__message">
          {contents}
        </div>
      </div>
    );
  }
};

LibrarySummary.propTypes = {
  message: PropTypes.object,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};
