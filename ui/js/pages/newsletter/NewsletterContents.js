"use strict";
import React, { Component, PropTypes } from 'react';
import { postNewsletterRender } from '../../actions';

export default class NewsletterContents extends Component {

  constructor () {
    super();
    this.state = {};
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this._load(nextProps);
  }

  _load (props) {
    if (props.item.name || props.item.text) {
      postNewsletterRender(props.item)
      .then(rendered => this.setState({ rendered: rendered }))
      .catch(error => console.log('!!! NewsletterContents catch', error));
    }
  }

  render () {
    return (
      <div dangerouslySetInnerHTML={{ __html: this.state.rendered }} />
    );
  }
};

NewsletterContents.PropTypes = {
  item: PropTypes.object.isRequired
};
