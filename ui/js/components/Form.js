"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from './PageHeader';
import FormError from './FormError';
import ConfirmRemove from './ConfirmRemove';

export default class Form extends Component {

  constructor (props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onRemove = this._onRemove.bind(this);
  }

  _onCancel () {
    this.context.router.goBack();
  }

  _onSubmit (event) {
    event.preventDefault();
    this.props.onSubmit();
  }

  _onRemove (event) {
    event.preventDefault();
    this.props.onRemove();
  }

  render () {
    const { title, action, submitLabel, onRemove, error } = this.props;

    const cancelControl = (
      <button className="button--header" type="button" onClick={this._onCancel}>
        Cancel
      </button>
    );

    let removeControl;
    if (onRemove) {
      removeControl = <ConfirmRemove onConfirm={this._onRemove} />;
    }

    return (
      <form className="form" action={action} onSubmit={this._onSubmit}>
        <PageHeader title={title} actions={cancelControl} />
        <FormError message={error} />
        {this.props.children}
        <footer className="form__footer">
          <button type="submit" onClick={this._onSubmit}>{submitLabel}</button>
          {removeControl}
        </footer>
      </form>
    );
  }
};

Form.propTypes = {
  action: PropTypes.string,
  error: PropTypes.object,
  onRemove: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

Form.contextTypes = {
  router: PropTypes.any
};
