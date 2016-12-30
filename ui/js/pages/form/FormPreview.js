"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import FormContents from './FormContents';

export default class FormPreview extends Component {

  constructor () {
    super();
    this._onChange = this._onChange.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this.state = {
      form: {
        fields: []
      }
    };
  }

  _onChange (form) {
    this.setState({ form: form });
  }

  _onSubmit (event) {
    event.preventDefauls();
    // no-op
  }

  render () {
    const { item: formTemplate } = this.props;
    const { form } = this.state;

    return (
      <main className="page-preview">
        <PageHeader title="Preview" />
        <form className="form" onSubmit={this._onSubmit}>
          <FormContents form={form} formTemplate={formTemplate}
            full={false} onChange={this._onChange} />
          <footer className="form__footer">
            <button type="submit" className="button">
              {formTemplate.submitLabel || 'Submit'}
            </button>
          </footer>
        </form>
      </main>
    );
  }
};

FormPreview.propTypes = {
  item: PropTypes.object.isRequired
};
