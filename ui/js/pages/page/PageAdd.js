"use strict";
import React, { Component, PropTypes } from 'react';
import { postItem } from '../../actions';
import PageForm from './PageForm';

export default class PageAdd extends Component {

  constructor (props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this.state = { page: { name: '' } };
  }

  _onAdd (page) {
    postItem('pages', page)
      .then(response => this.context.router.goBack())
      .catch(error => this.setState({ error: error }));
  }

  render () {
    return (
      <PageForm title="Add Page" submitLabel="Add"
        action={`/api/pages`} page={this.state.page}
        onSubmit={this._onAdd}
        error={this.state.error} />
    );
  }
};

PageAdd.contextTypes = {
  router: PropTypes.any
};
