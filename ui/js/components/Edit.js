"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, putItem, deleteItem } from '../actions';

export default class Edit extends Component {

  constructor (props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this.state = { item: {} };
  }

  componentDidMount () {
    getItem(this.props.category, this.props.params.id)
      .then(response => this.setState({ item: response }));
  }

  _onUpdate (item) {
    putItem(this.props.category, item)
      .then(response => this.context.router.goBack())
      .catch(error => this.setState({ error: error }));
  }

  _onRemove () {
    deleteItem(this.props.category, this.props.params.id)
      .then(response => this.context.router.go(-2))
      .catch(error => this.setState({ error: error }));
  }

  render () {
    const { category, params: { id }, Form, title } = this.props;
    return (
      <Form title={title} submitLabel="Update"
        action={`/api/${category}/${id}`} item={this.state.item}
        onSubmit={this._onUpdate} onRemove={this._onRemove}
        error={this.state.error} />
    );
  }
};

Edit.propTypes = {
  category: PropTypes.string,
  Form: PropTypes.func,
  title: PropTypes.string
};

Edit.contextTypes = {
  router: PropTypes.any
};
