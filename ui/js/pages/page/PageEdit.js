"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, putItem, deleteItem } from '../../actions';
import PageForm from './PageForm';

export default class PageEdit extends Component {

  constructor (props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this.state = { page: {} };
  }

  componentDidMount () {
    getItem('pages', this.props.params.id)
      .then(response => this.setState({ page: response }));
  }

  _onUpdate (page) {
    putItem('pages', page)
      .then(response => this.context.router.goBack())
      .catch(error => this.setState({ error: error }));
  }

  _onRemove () {
    deleteItem('pages', this.props.params.id)
      .then(response => this.context.router.go(-2))
      .catch(error => this.setState({ error: error }));
  }

  render () {
    return (
      <PageForm title="Edit Page" submitLabel="Update"
        action={`/api/pages/${this.props.params.id}`} page={this.state.page}
        onSubmit={this._onUpdate} onRemove={this._onRemove}
        error={this.state.error} />
    );
  }
};

PageEdit.contextTypes = {
  router: PropTypes.any
};
