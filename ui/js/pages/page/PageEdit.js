"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, putPage, deleteItem } from '../../actions';
import Form from '../../components/Form';
import PageFormContents from './PageFormContents';
import PagePreview from './PagePreview';

const TITLE = "Page Edit";

export default class PageEdit extends Component {

  constructor (props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this.state = { page: {} };
  }

  componentDidMount () {
    document.title = TITLE;
    getItem("pages", this.props.params.id)
    .then(page => this.setState({ page: page }))
    .catch(error => console.log('!!! PageEdit catch', error));
  }

  _onUpdate (item) {
    putPage(item)
    .then(response => this.context.router.goBack())
    .catch(error => this.setState({ error: error }));
  }

  _onRemove () {
    deleteItem("pages", this.props.params.id)
    .then(response => this.context.router.go('/pages'))
    .catch(error => this.setState({ error: error }));
  }

  render () {
    const { params: { id } } = this.props;
    const { page, error } = this.state;
    return (
      <Form title={TITLE} submitLabel="Update"
        action={`/api/pages/${id}`}
        FormContents={PageFormContents} Preview={PagePreview} item={page}
        onSubmit={this._onUpdate} onRemove={this._onRemove}
        error={error} />
    );
  }
};

PageEdit.defaultProps = {
  page: PropTypes.object,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};

PageEdit.contextTypes = {
  router: PropTypes.any
};
