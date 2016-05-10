"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, putItem, deleteItem } from '../actions';
import Form from './Form';

export default class Edit extends Component {

  constructor (props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this.state = { item: {} };
  }

  componentDidMount () {
    getItem(this.props.category, this.props.params.id)
    .then(response => this.setState({ item: response }))
    .catch(error => console.log("!!! Edit catch", error));;
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
    const { category, params: { id }, FormContents, Preview, title } = this.props;
    const { item, error } = this.state;
    return (
      <Form title={title} submitLabel="Update"
        action={`/api/${category}/${id}`}
        FormContents={FormContents} Preview={Preview} item={item}
        onSubmit={this._onUpdate} onRemove={this._onRemove}
        error={error} />
    );
  }
};

Edit.propTypes = {
  category: PropTypes.string.isRequired,
  FormContents: PropTypes.func.isRequired,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired,
  Preview: PropTypes.func,
  title: PropTypes.string.isRequired
};

Edit.contextTypes = {
  router: PropTypes.any
};