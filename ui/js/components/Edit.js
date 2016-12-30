"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, putItem, deleteItem } from '../actions';
import Form from './Form';

export default class Edit extends Component {

  constructor (props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this.state = { item: {} };
  }

  componentDidMount () {
    document.title = this.props.title;
    getItem(this.props.category, this.props.params.id)
    .then(item => this.setState({ item: item }))
    .catch(error => console.log("!!! Edit catch", error));
  }

  _onUpdate (item) {
    putItem(this.props.category, item)
    .then(response => {
      if (this.props.onUpdate) {
        return this.props.onUpdate(item);
      } else {
        return response;
      }
    })
    .then(response => this.context.router.goBack())
    .catch(error => this.setState({ error: error }));
  }

  _onRemove () {
    const { category, params: { id }, removeBackLevel } = this.props;
    deleteItem(category, id)
    .then(response => this.context.router.go(- (removeBackLevel || 2)))
    .catch(error => this.setState({ error: error }));
  }

  _onCancel () {
    this.context.router.goBack();
  }

  render () {
    const {
      category, params: { id }, FormContents, Preview, title
    } = this.props;
    const { item, error } = this.state;
    return (
      <Form title={title} submitLabel="Update"
        action={`/api/${category}/${id}`}
        FormContents={FormContents} Preview={Preview} item={item}
        onSubmit={this._onUpdate} onRemove={this._onRemove}
        error={error} onCancel={this._onCancel} />
    );
  }
};

Edit.propTypes = {
  category: PropTypes.string.isRequired,
  FormContents: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired,
  Preview: PropTypes.func,
  removeBackLevel: PropTypes.number,
  title: PropTypes.string.isRequired
};

Edit.contextTypes = {
  router: PropTypes.any
};
