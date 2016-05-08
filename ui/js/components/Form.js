"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from './PageHeader';
import FormError from './FormError';
import FormState from '../utils/FormState';
import ConfirmRemove from './ConfirmRemove';

export default class Form extends Component {

  constructor (props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this._setItem = this._setItem.bind(this);
    this.state = {
      formState: new FormState(props.item, this._setItem)
    };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ formState: new FormState(nextProps.item, this._setItem) });
  }

  _onCancel () {
    this.context.router.goBack();
  }

  _onSubmit (event) {
    event.preventDefault();
    this.props.onSubmit(this.state.formState.object);
  }

  _onRemove (event) {
    event.preventDefault();
    this.props.onRemove();
  }

  _setItem (item) {
    this.setState({ formState: new FormState(item, this._setItem) });
  }

  render () {
    const { title, action, submitLabel, onRemove, error, Preview, FormContents } = this.props;
    const { formState } = this.state;

    const cancelControl = (
      <button className="button--header" type="button" onClick={this._onCancel}>
        Cancel
      </button>
    );

    let removeControl;
    if (onRemove) {
      removeControl = <ConfirmRemove onConfirm={this._onRemove} />;
    }

    let preview;
    if (Preview) {
      preview = <Preview item={formState.object} />;
    }

    return (
      <div className="form__container">
        <form className="form" action={action} onSubmit={this._onSubmit}>
          <PageHeader title={title} actions={cancelControl} />
          <FormError message={error} />
          <FormContents formState={this.state.formState} />
          <footer className="form__footer">
            <button type="submit" onClick={this._onSubmit}>{submitLabel}</button>
            {removeControl}
          </footer>
        </form>
        {preview}
      </div>
    );
  }
};

Form.propTypes = {
  action: PropTypes.string,
  error: PropTypes.object,
  FormContents: PropTypes.func.isRequired,
  item: PropTypes.object.isRequired,
  onRemove: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  Preview: PropTypes.func,
  submitLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

Form.contextTypes = {
  router: PropTypes.any
};
