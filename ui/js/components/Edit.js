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
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.id !== this.props.params.id) {
      this._load(nextProps);
    }
  }

  _load (props) {
    document.title = props.title;
    getItem(props.category, props.params.id)
    .then(item => {
      const { onChange } = props;
      this.setState({ item: item });
      if (onChange) {
        onChange(item);
      }
    })
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
      actions, category, params: { id }, footerActions, FormContents,
      onChange, Preview, submitLabel, title
    } = this.props;
    const { item, error } = this.state;
    return (
      <Form title={title} actions={actions} footerActions={footerActions}
        submitLabel={submitLabel || "Update"}
        action={`/api/${category}/${id}`}
        FormContents={FormContents} Preview={Preview} item={item}
        onChange={onChange}
        onSubmit={this._onUpdate} onRemove={this._onRemove}
        error={error} onCancel={this._onCancel} />
    );
  }
};

Edit.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.element),
  category: PropTypes.string.isRequired,
  FormContents: PropTypes.func.isRequired,
  footerActions: PropTypes.node,
  onChange: PropTypes.func,
  onUpdate: PropTypes.func,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired,
  Preview: PropTypes.func,
  removeBackLevel: PropTypes.number,
  submitLabel: PropTypes.string,
  title: PropTypes.string.isRequired
};

Edit.contextTypes = {
  router: PropTypes.any
};
