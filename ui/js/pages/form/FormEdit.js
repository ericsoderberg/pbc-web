"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, putItem, deleteItem } from '../../actions';
import ConfirmRemove from '../../components/ConfirmRemove';
import Loading from '../../components/Loading';
import FormContents from './FormContents';
import { setFormError, clearFormError } from './FormUtils';

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
    getItem('forms', this.props.id || this.props.params.id)
    .then(form => {
      this.setState({ form: form });
      return getItem('form-templates', form.formTemplateId);
    })
    .then(formTemplate => this.setState({ formTemplate: formTemplate }))
    .catch(error => console.log("!!! FormEdit catch", error));
  }

  _onUpdate (event) {
    event.preventDefault();
    const { onDone } = this.props;
    const { formTemplate, form } = this.state;
    const error = setFormError(formTemplate, form);

    if (error) {
      this.setState({ error: error });
    } else {
      putItem('forms', this.state.form)
      .then(response => onDone ? onDone() : this.context.router.goBack())
      .catch(error => this.setState({ error: error }));
    }
  }

  _onCancel () {
    const { onCancel } = this.props;
    if (onCancel) {
      onCancel();
    } else {
      this.context.router.goBack();
    }
  }

  _onRemove (event) {
    const { onDone } = this.props;
    event.preventDefault();
    deleteItem('forms', this.props.id || this.props.params.id)
    .then(response => onDone ? onDone() : this.context.router.goBack())
    .catch(error => this.setState({ error: error }));
  }

  _onChange (form) {
    const { formTemplate } = this.state;
    // clear any error for fields that have changed
    const error = clearFormError(formTemplate, form, this.state.error);
    this.setState({ form: form, error: error });
  }

  render () {
    const { form, formTemplate } = this.state;

    let result;
    if (form && formTemplate) {

      result = (
        <form className="form" action={`/forms${form._id}`}
          onSubmit={this._onUpdate}>
          <FormContents form={form} formTemplate={formTemplate}
            onChange={this._onChange} />
          <footer className="form__footer">
            <button type="submit" className="button">Update</button>
            <ConfirmRemove onConfirm={this._onRemove} />
            <button type="button" className="button button--secondary"
              onClick={this._onCancel}>
              Cancel
            </button>
          </footer>
        </form>
      );

    } else {
      result = <Loading />;
    }
    return result;
  }
};

FormEdit.propTypes = {
  id: PropTypes.string,
  onCancel: PropTypes.func,
  onDone: PropTypes.func,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  })
};

FormEdit.contextTypes = {
  router: PropTypes.any
};
