"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, putItem, deleteItem } from '../../actions';
import ConfirmRemove from '../../components/ConfirmRemove';
import FormContents from './FormContents';

export default class FormEdit extends Component {

  constructor (props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this._onChange = this._onChange.bind(this);
    this.state = {
      form: {
        fields: [],
        formTemplateId: props.formTemplateId || (props.formTemplate || {})._id
      },
      formTemplate: props.formTemplate || {}
    };
  }

  componentDidMount () {
    getItem('forms', this.props.params.id)
    .then(form => {
      this.setState({ form: form });
      return getItem('form-templates', form.formTemplateId);
    })
    .then(formTemplate => this.setState({ formTemplate: formTemplate }))
    .catch(error => console.log("!!! FormEdit catch", error));
  }

  _onUpdate (event) {
    event.preventDefault();
    putItem('forms', this.state.form)
    .then(response => this.context.router.goBack())
    .catch(error => this.setState({ error: error }));
  }

  _onCancel () {
    this.context.router.goBack();
  }

  _onRemove (event) {
    event.preventDefault();
    deleteItem('forms', this.props.params.id)
    .then(response => this.context.router.go(-1))
    .catch(error => this.setState({ error: error }));
  }

  _onChange (form) {
    this.setState({ form: form });
  }

  render () {
    const { form } = this.state;
    const formTemplate = this.state.formTemplate || {};

    return (
      <form className="form" action={`/forms${form._id}`}
        onSubmit={this._onUpdate}>
        <FormContents form={form} formTemplate={formTemplate}
          onChange={this._onChange} />
        <footer className="form__footer">
          <button type="submit">
            {formTemplate.submitLabel || 'Update'}
          </button>
          <ConfirmRemove onConfirm={this._onRemove} />
          <button type="button" onClick={this._onCancel}>
            Cancel
          </button>
        </footer>
      </form>
    );
  }
};

FormEdit.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};

FormEdit.contextTypes = {
  router: PropTypes.any
};
