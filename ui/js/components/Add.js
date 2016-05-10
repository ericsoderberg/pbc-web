"use strict";
import React, { Component, PropTypes } from 'react';
import { postItem } from '../actions';
import Form from './Form';

export default class Add extends Component {

  constructor (props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this.state = { item: {} };
  }

  _onAdd (item) {
    postItem(this.props.category, item)
    .then(response => this.context.router.goBack())
    .catch(error => this.setState({ error: error }));
  }

  render () {
    const { category, FormContents, Preview, title } = this.props;
    const { item, error } = this.state;
    return (
      <Form title={title} submitLabel="Add"
        action={`/api/${category}`}
        FormContents={FormContents} Preview={Preview} item={item}
        onSubmit={this._onAdd} error={error} />
    );
  }
};

Add.propTypes = {
  category: PropTypes.string.isRequired,
  FormContents: PropTypes.func.isRequired,
  Preview: PropTypes.func,
  title: PropTypes.string.isRequired
};

Add.contextTypes = {
  router: PropTypes.any
};