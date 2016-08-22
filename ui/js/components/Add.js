"use strict";
import React, { Component, PropTypes } from 'react';
import { postItem } from '../actions';
import Form from './Form';

export default class Add extends Component {

  constructor (props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this.state = { };
  }

  componentDidMount () {
    document.title = this.props.title;
  }

  _onAdd (item) {
    const { category, showable } = this.props;
    postItem(category, item)
    .then(response => {
      if (this.props.onAdd) {
        return this.props.onAdd(item);
      } else {
        return response;
      }
    })
    .then(newItem => {
      if (showable) {
        this.context.router.push(`/${category}/${newItem._id}`);
      } else {
        this.context.router.goBack();
      }
    })
    .catch(error => this.setState({ error: error, item: item }));
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
  onAdd: PropTypes.func,
  Preview: PropTypes.func,
  showable: PropTypes.bool,
  title: PropTypes.string.isRequired
};

Add.contextTypes = {
  router: PropTypes.any
};
