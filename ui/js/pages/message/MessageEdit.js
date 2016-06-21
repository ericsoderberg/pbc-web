"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, putMessage, deleteItem } from '../../actions';
import Form from '../../components/Form';
import MessageFormContents from './MessageFormContents';
import MessagePreview from './MessagePreview';

const TITLE = "Message Edit";

export default class MessageEdit extends Component {

  constructor (props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this.state = { message: {} };
  }

  componentDidMount () {
    document.title = TITLE;
    getItem("messages", this.props.params.id)
    .then(message => this.setState({ message: message }))
    .catch(error => console.log('!!! PageEdit catch', error));
  }

  _onUpdate (item) {
    putMessage(item)
    .then(response => this.context.router.goBack())
    .catch(error => this.setState({ error: error }));
  }

  _onRemove () {
    deleteItem("messages", this.props.params.id)
    .then(response => this.context.router.go('/messages'))
    .catch(error => this.setState({ error: error }));
  }

  render () {
    const { params: { id } } = this.props;
    const { message, error } = this.state;
    return (
      <Form title={TITLE} submitLabel="Update"
        action={`/api/messages/${id}`}
        FormContents={MessageFormContents} Preview={MessagePreview} item={message}
        onSubmit={this._onUpdate} onRemove={this._onRemove}
        error={error} />
    );
  }
};

MessageEdit.defaultProps = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};

MessageEdit.contextTypes = {
  router: PropTypes.any
};
