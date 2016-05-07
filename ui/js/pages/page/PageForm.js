"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import FormEvents from '../../utils/FormEvents';
import ConfirmRemove from '../../components/ConfirmRemove';

export default class PageForm extends Component {

  constructor (props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this.state = { page: props.item };
  }

  componentDidMount () {
    this.refs.name.focus();
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ page: nextProps.item });
  }

  _onCancel () {
    this.context.router.goBack();
  }

  _onSubmit (event) {
    event.preventDefault();
    this.props.onSubmit(this.state.page);
  }

  _onRemove (event) {
    event.preventDefault();
    this.props.onRemove();
  }

  render () {
    const { title, action, submitLabel, onRemove, error } = this.props;
    const { page } = this.state;
    const formEvents = new FormEvents(page, (page) => this.setState({ page: page}));

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
        <fieldset className="form__fields">
          <FormField name="name" label="Name">
            <input ref="name" name="name" value={page.name || ''}
              onChange={formEvents.change('name')}/>
          </FormField>
        </fieldset>
        <footer className="form__footer">
          <button type="submit" onClick={this._onSubmit}>{submitLabel}</button>
          {removeControl}
        </footer>
      </form>
    );
  }
};

PageForm.propTypes = {
  action: PropTypes.string,
  error: PropTypes.object,
  item: PropTypes.object.isRequired,
  onRemove: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

PageForm.contextTypes = {
  router: PropTypes.any
};
