"use strict";
import React, { Component, PropTypes } from 'react';
import { getPage, putPage, deleteItem } from '../../actions';
import Form from '../../components/Form';
import Stored from '../../components/Stored';
import PageFormContents from './PageFormContents';
import PagePreview from './PagePreview';

const TITLE = "Page Edit";

class PageEdit extends Component {

  constructor (props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this.state = { item: {} };
  }

  componentDidMount () {
    document.title = TITLE;
    if (! this.props.page) {
      getPage(this.props.params.id)
      .catch(error => console.log('!!! PageEdit catch', error));
    }
  }

  _onUpdate (item) {
    putPage(item)
    .then(response => this.context.router.goBack())
    .catch(error => this.setState({ error: error }));
  }

  _onRemove () {
    deleteItem(this.props.category, this.props.params.id)
    .then(response => this.context.router.go('/pages'))
    .catch(error => this.setState({ error: error }));
  }

  render () {
    const { page, params: { id } } = this.props;
    const { error } = this.state;
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

const select = (state, props) => {
  let page;
  if (state.pages) {
    page = state.pages[props.params.id];
  }
  return {
    page: page
  };
};

export default Stored(PageEdit, select);
