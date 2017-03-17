
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem, putItem, deleteItem } from '../../actions';
import PageHeader from '../../components/PageHeader';
import ConfirmRemove from '../../components/ConfirmRemove';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import FormContents from './FormContents';
import { setFormError, clearFormError, finalizeForm } from './FormUtils';

class FormEdit extends Component {

  constructor(props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this._onChange = this._onChange.bind(this);
    this.state = {
      form: {
        fields: [],
        formTemplateId: props.formTemplateId || (props.formTemplate || {})._id,
      },
      formTemplate: props.formTemplate || {},
    };
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.id !== this.props.params.id ||
      nextProps.id !== this.props.id) {
      this._load(nextProps);
    }
  }

  _load(props) {
    getItem('forms', props.id || props.params.id)
    .then((form) => {
      this.setState({ form, formTemplate: undefined, linkedForm: undefined });
      if (form.linkedFormId) {
        return getItem('forms', form.linkedFormId)
        .then(linkedForm => this.setState({ linkedForm }))
        .then(() => form);
      }
      return form;
    })
    .then(form => getItem('form-templates', form.formTemplateId._id))
    .then((formTemplate) => {
      this.setState({ formTemplate });
      document.title = formTemplate.name;
    })
    .catch(error => console.error('!!! FormEdit catch', error));
  }

  _onUpdate(event) {
    event.preventDefault();
    const { onDone } = this.props;
    const { formTemplate, form, linkedForm } = this.state;
    const error = setFormError(formTemplate, form);

    if (error) {
      this.setState({ error });
    } else {
      finalizeForm(formTemplate, form, linkedForm);
      putItem('forms', this.state.form)
      .then(() => (onDone ? onDone() : this.context.router.goBack()))
      .catch(error2 => this.setState({ error2 }));
    }
  }

  _onCancel() {
    const { onCancel } = this.props;
    if (onCancel) {
      onCancel();
    } else {
      this.context.router.goBack();
    }
  }

  _onRemove(event) {
    const { onDone } = this.props;
    event.preventDefault();
    deleteItem('forms', this.props.id || this.props.params.id)
    .then(() => (onDone ? onDone() : this.context.router.goBack()))
    .catch(error => this.setState({ error }));
  }

  _onChange(form) {
    const { formTemplate } = this.state;
    // clear any error for fields that have changed
    const error = clearFormError(formTemplate, form, this.state.error);
    this.setState({ form, error });
  }

  render() {
    const { className, full, inline, onLinkedForm } = this.props;
    const { error, form, formTemplate, linkedForm } = this.state;
    const classNames = ['form'];
    if (className) {
      classNames.push(className);
    }

    let result;
    if (form && formTemplate) {
      const submitLabel = 'Update';
      // if (formTemplate.payable && form.paymentIds.length === 0) {
      //   submitLabel = 'Pay';
      // }

      let header;
      if (!inline) {
        const cancelControl = [
          <button key="cancel" type="button" className="button"
            onClick={this._onCancel}>
            Cancel
          </button>,
        ];
        header = (
          <PageHeader title={formTemplate.name} actions={cancelControl} />
        );
      }

      let linkedFormControl;
      if (linkedForm) {
        if (!inline) {
          linkedFormControl = (
            <span className="form__link">
              from <Link to={`/forms/${linkedForm._id}/edit`}>
                {linkedForm.formTemplateId.name}
              </Link>
            </span>
          );
        } else {
          linkedFormControl = (
            <span className="form__link">
              from <a onClick={() => onLinkedForm(linkedForm._id)}>
                {linkedForm.formTemplateId.name}
              </a>
            </span>
          );
        }
      }

      result = (
        <form className={classNames.join(' ')} action={`/forms/${form._id}`}
          onSubmit={this._onUpdate}>
          {header}
          <FormContents form={form} formTemplate={formTemplate}
            linkedForm={linkedForm} linkedFormControl={linkedFormControl}
            full={full} onChange={this._onChange} error={error} />
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

      if (!inline) {
        result = <div className="form__container">{result}</div>;
      }
    } else {
      result = <Loading />;
    }
    return result;
  }
}

FormEdit.propTypes = {
  className: PropTypes.string,
  formTemplate: PropTypes.object,
  formTemplateId: PropTypes.string,
  full: PropTypes.bool,
  id: PropTypes.string,
  inline: PropTypes.bool,
  onCancel: PropTypes.func,
  onDone: PropTypes.func,
  onLinkedForm: PropTypes.func,
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};

FormEdit.defaultProps = {
  className: undefined,
  formTemplate: undefined,
  formTemplateId: undefined,
  full: true,
  id: undefined,
  inline: false,
  onCancel: undefined,
  onDone: undefined,
  onLinkedForm: undefined,
  params: {},
};

FormEdit.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  session: state.session,
});

export default Stored(FormEdit, select);
