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

  _onAdd (event) {
    const { onDone } = this.props;
    event.preventDefault();
    postItem('forms', this.state.form)
    .then(response => onDone ? onDone() : this.context.router.goBack())
    .catch(error => this.setState({ error: error }));
  }

  _onChange (form) {
    this.setState({ form: form });
  }

  render () {
    const { onCancel } = this.props;
    const { form, formTemplate } = this.state;

    let result;
    if (formTemplate) {
      
      let cancelControl;
      if (onCancel) {
        cancelControl = <button type="button" onClick={onCancel}>Cancel</button>;
      }

      result = (
        <form className="form" action={'/forms'} onSubmit={this._onAdd}>
          <FormContents form={form} formTemplate={formTemplate}
            onChange={this._onChange} />
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
