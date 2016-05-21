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
        formTemplateId: props.formTemplateId || (props.formTemplate || {})._id
      },
      formTemplate: props.formTemplate || {}
    };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ formTemplate: nextProps.formTemplate });
    this._load(nextProps);
  }

  _load (props) {
    if (! props.formTemplate && props.formTemplateId) {
      getItem('form-templates', props.formTemplateId)
      .then(formTemplate => this.setState({ formTemplate: formTemplate }))
      .catch(error => console.log("!!! FormAdd catch", error));
    }
  }

  _onAdd (event) {
    event.preventDefault();
    postItem('forms', this.state.form)
    .then(response => this.context.router.goBack())
    .catch(error => this.setState({ error: error }));
  }

  _onChange (form) {
    this.setState({ form: form });
  }

  render () {
    const { form, formTemplate } = this.state;

    return (
      <form className="form" action={'/forms'} onSubmit={this._onAdd}>
        <FormContents form={form} formTemplate={formTemplate}
          onChange={this._onChange} />
        <footer className="form__footer">
          <button type="submit">
            {formTemplate.submitLabel || 'Submit'}
          </button>
        </footer>
      </form>
    );
  }
};

FormAdd.propTypes = {
  formTemplateId: PropTypes.string,
  formTemplate: PropTypes.object
};

FormAdd.contextTypes = {
  router: PropTypes.any
};
