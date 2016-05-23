"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, postItem } from '../../actions';
import FormContents from './FormContents';

export default class FormAdd extends Component {

  constructor (props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._onChange = this._onChange.bind(this);
    this.state = {
      form: {
        fields: [],
        formTemplateId: props.formTemplateId
      }
    };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.formTemplateId !== this.props.formTemplateId) {
      this._load(nextProps);
    }
  }

  _load (props) {
    getItem('form-templates', props.formTemplateId)
    .then(formTemplate => this.setState({ formTemplate: formTemplate }))
    .catch(error => console.log("!!! FormAdd catch", error));
  }

  _setError (formTemplate, form) {
    let error;
    // check for required fields
    formTemplate.sections.forEach(section => {
      section.fields.forEach(templateField => {
        if (templateField.required) {
          // see if we have it
          if (! form.fields.some(field => (
            field.fieldId === templateField._id && field.value))) {
            if (! error) {
              error = {};
            }
            error[templateField._id] = 'required';
          }
        }
      });
    });
    return error;
  }

  _clearError (formTemplate, form, error) {
    error = { ...error };
    formTemplate.sections.forEach(section => {
      section.fields.forEach(templateField => {
        if (templateField.required) {
          // see if we have it
          if (form.fields.some(field => (
            field.fieldId === templateField._id && field.value))) {
            delete error[templateField._id];
          }
        }
      });
    });
    return error;
  }

  _onAdd (event) {
    event.preventDefault();
    const { onDone } = this.props;
    const { formTemplate, form } = this.state;

    const error = this._setError(formTemplate, form);

    if (error) {
      this.setState({ error: error });
    } else {
      postItem('forms', form)
      .then(response => onDone ? onDone() : this.context.router.goBack())
      .catch(error => this.setState({ error: error }));
    }
  }

  _onChange (form) {
    const { formTemplate } = this.state;
    // clear any error for fields that have changed
    const error = this._clearError(formTemplate, form, this.state.error);
    this.setState({ form: form, error: error });
  }

  render () {
    const { onCancel } = this.props;
    const { form, formTemplate, error } = this.state;

    let result;
    if (formTemplate) {

      let cancelControl;
      if (onCancel) {
        cancelControl = <button type="button" onClick={onCancel}>Cancel</button>;
      }

      result = (
        <form className="form" action={'/forms'} onSubmit={this._onAdd}>
          <FormContents form={form} formTemplate={formTemplate}
            onChange={this._onChange} error={error} />
          <footer className="form__footer">
            <button type="submit">
              {formTemplate.submitLabel || 'Submit'}
            </button>
            {cancelControl}
          </footer>
        </form>
      );

    } else {
      result = <span>Loading ...</span>;
    }
    return result;
  }
};

FormAdd.propTypes = {
  formTemplateId: PropTypes.string.isRequired,
  formTemplate: PropTypes.object,
  onCancel: PropTypes.func,
  onDone: PropTypes.func
};

FormAdd.contextTypes = {
  router: PropTypes.any
};
