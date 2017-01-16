"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, putItem, deleteItem } from '../../actions';
import PageHeader from '../../components/PageHeader';
import ConfirmRemove from '../../components/ConfirmRemove';
import Loading from '../../components/Loading';
import FormContents from './FormContents';
import { setFormError, clearFormError, finalizeForm } from './FormUtils';

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
    .then(formTemplate => {
      this.setState({ formTemplate: formTemplate });
      document.title = formTemplate.name;
    })
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
      finalizeForm(formTemplate, form);
      putItem('forms', this.state.form)
      .then(response => (onDone ? onDone() : this.context.router.goBack()))
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
    const { full, inline } = this.props;
    const { form, formTemplate } = this.state;
    let classNames = ['form'];
    if (this.props.className) {
      classNames.push(this.props.className);
    }

    let result;
    if (form && formTemplate) {

      let submitLabel = 'Update';
      if (formTemplate.payable && form.paymentIds.length === 0) {
        submitLabel = 'Pay';
      }

      let header;
      if (inline) {
        header = (
          <div className='form__text'>
            <h2>{formTemplate.name}</h2>
          </div>
        );
      } else {
        const cancelControl = [
          <button key="cancel" type="button" className="button"
            onClick={this._onCancel}>
            Cancel
          </button>
        ];
        header = (
          <PageHeader title={formTemplate.name} actions={cancelControl} />
        );
      }

      result = (
        <form className={classNames.join(' ')} action={`/forms${form._id}`}
          onSubmit={this._onUpdate}>
          {header}
          <FormContents form={form} formTemplate={formTemplate}
            full={full} onChange={this._onChange} />
          <footer className="form__footer">
            <button type="submit" className="button">{submitLabel}</button>
            <ConfirmRemove onConfirm={this._onRemove} />
            <button type="button" className="button button--secondary"
              onClick={this._onCancel}>
              Cancel
            </button>
          </footer>
        </form>
      );

      if (! inline) {
        result = <div className="form__container">{result}</div>;
      }

    } else {
      result = <Loading />;
    }
    return result;
  }
};

FormEdit.propTypes = {
  full: PropTypes.bool,
  id: PropTypes.string,
  inline: PropTypes.bool,
  onCancel: PropTypes.func,
  onDone: PropTypes.func,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  })
};

FormEdit.defaultProps = {
  full: true
};

FormEdit.contextTypes = {
  router: PropTypes.any
};
