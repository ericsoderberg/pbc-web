"use strict";
import React, { Component, PropTypes } from 'react';
import { postItem } from '../actions';

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
    const { category, Form, title } = this.props;
    return (
      <Form title={title} submitLabel="Add"
        action={`/api/${category}`} item={this.state.item}
        onSubmit={this._onAdd}
        error={this.state.error} />
    );
  }
};

Add.propTypes = {
  category: PropTypes.string.isRequired,
  Form: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
};

Add.contextTypes = {
  router: PropTypes.any
};
