"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';

export default class PageForm extends Component {

  constructor (props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onToggle = this._onToggle.bind(this);
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

  _onChange (propertyName) {
    return (event => {
      let page = { ...this.state.page };
      page[propertyName] = event.target.value;
      this.setState({ page: page });
    });
  }

  _onToggle (propertyName) {
    return (event => {
      let page = { ...this.state.page };
      page[propertyName] = ! page[propertyName];
      this.setState({ page: page });
    });
  }

  _onFile (propertyName) {
    return (event => {
      const files = event.target.files;
      let fileData;
      if (files && files[0]) {
        const file = files[0];
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          fileData = {
            data: reader.result,
            name: file.name,
            size: file.size,
            mimeType: file.type
          };
          let page = { ...this.state.page };
          page[propertyName] = fileData;
          this.setState({ page: page });
        });
        reader.readAsDataURL(file);
      }
    });
  }

  render () {
    const { title, action, submitLabel, onRemove, error } = this.props;
    const { page } = this.state;

    const cancelControl = (
      <button className="button--header" type="button" onClick={this._onCancel}>
        Cancel
      </button>
    );
    let removeControl;
    if (onRemove) {
      removeControl = <button onClick={this._onRemove}>Remove</button>;
    }
    return (
      <form className="form" action={action} onSubmit={this._onSubmit}>
        <PageHeader title={title} actions={cancelControl} />
        <FormError message={error} />
        <fieldset className="form__fields">
          <FormField name="name" label="Name">
            <input ref="name" name="name" value={page.name || ''}
              onChange={this._onChange('name')}/>
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
