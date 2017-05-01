
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loadItem, putItem, deleteItem, unloadItem } from '../../actions';
import PageHeader from '../../components/PageHeader';
import ConfirmRemove from '../../components/ConfirmRemove';
import Loading from '../../components/Loading';
import FormContents from './FormContents';
import { setFormError, clearFormError, finalizeForm } from './FormUtils';

class FormEdit extends Component {

  constructor(props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this._onChange = this._onChange.bind(this);
    this.state = {};
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {
      dispatch, form, formTemplateId, formTemplate, id, linkedFormId, linkedForm,
    } = nextProps;
    if (id !== this.props.id) {
      this.setState({
        form: undefined, formTemplate: undefined, linkedForm: undefined,
      });
      this._load(nextProps);
    } else if (form && !this.state.form) {
      this.setState({ form: { ...form } });
      if (formTemplateId && !formTemplate) {
        dispatch(loadItem('form-templates', formTemplateId));
      }
      if (linkedFormId && !linkedForm) {
        dispatch(loadItem('forms', linkedFormId));
      }
    }
  }

  componentWillUnmount() {
    const { dispatch, formTemplateId, id, linkedFormId } = this.props;
    dispatch(unloadItem('forms', id));
    if (formTemplateId) {
      dispatch(unloadItem('form-templates', formTemplateId));
    }
    if (linkedFormId) {
      dispatch(unloadItem('forms', linkedFormId));
    }
  }

  _load(props) {
    const { dispatch, id } = props;
    dispatch(loadItem('forms', id));
  }

  _onUpdate(event) {
    event.preventDefault();
    const { formTemplate, history, linkedForm, onDone } = this.props;
    const { form } = this.state;
    const error = setFormError(formTemplate, form);

    if (error) {
      this.setState({ error });
    } else {
      finalizeForm(formTemplate, form, linkedForm);
      putItem('forms', this.state.form)
      .then(formSaved => (onDone ? onDone(formSaved) : history.goBack()))
      .catch(error2 => this.setState({ error2 }));
    }
  }

  _onCancel() {
    const { history, onCancel } = this.props;
    if (onCancel) {
      onCancel();
    } else {
      history.goBack();
    }
  }

  _onRemove(event) {
    const { onDone, history, id } = this.props;
    event.preventDefault();
    deleteItem('forms', id)
    .then(() => (onDone ? onDone() : history.goBack()))
    .catch((error) => {
      console.error('!!!', error);
      this.setState({ error });
    });
  }

  _onChange(form) {
    const { formTemplate } = this.props;
    // clear any error for fields that have changed
    const error = clearFormError(formTemplate, form, this.state.error);
    this.setState({ form, error });
  }

  render() {
    const {
      className, formTemplate, full, inline, linkedForm, onLinkedForm,
    } = this.props;
    const { form, error } = this.state;
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
  dispatch: PropTypes.func.isRequired,
  form: PropTypes.object,
  formTemplate: PropTypes.object,
  formTemplateId: PropTypes.string,
  full: PropTypes.bool,
  history: PropTypes.any.isRequired,
  id: PropTypes.string.isRequired,
  inline: PropTypes.bool,
  linkedForm: PropTypes.object,
  linkedFormId: PropTypes.string,
  onCancel: PropTypes.func,
  onDone: PropTypes.func,
  onLinkedForm: PropTypes.func,
};

FormEdit.defaultProps = {
  className: undefined,
  form: undefined,
  formTemplate: undefined,
  formTemplateId: undefined,
  full: true,
  inline: false,
  linkedForm: undefined,
  linkedFormId: undefined,
  onCancel: undefined,
  onDone: undefined,
  onLinkedForm: undefined,
};

const select = (state, props) => {
  const id = props.match.params.id;
  const form = state[id];
  const formTemplateId = form ? form.formTemplateId._id : undefined;
  const linkedFormId = form ? form.linkedFormId : undefined;
  return {
    id,
    form,
    formTemplateId,
    formTemplate: formTemplateId ? state[formTemplateId] : undefined,
    linkedFormId,
    linkedForm: linkedFormId ? state[linkedFormId] : undefined,
    notFound: state.notFound[id],
    session: state.session,
  };
};

export default connect(select)(FormEdit);
