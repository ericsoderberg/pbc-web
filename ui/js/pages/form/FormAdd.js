
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loadItem, postItem, unloadItem, haveSession, setSession } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { searchToObject } from '../../utils/Params';
import FormContents from './FormContents';
import { setFormError, clearFormError, finalizeForm } from './FormUtils';

class FormAdd extends Component {

  constructor(props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._onChange = this._onChange.bind(this);
    this.state = {};
    if (props.formTemplate) {
      this.state.form = { ...props.formTemplate.newForm };
    }
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { formTemplateId, formTemplate } = nextProps;
    if (formTemplateId !== this.props.formTemplateId) {
      this.setState({ form: undefined });
      this._load(nextProps);
    } else if (formTemplate && !this.state.form) {
      this.setState({ form: { ...formTemplate.newForm } });
    }
  }

  componentWillUnmount() {
    const { dispatch, formTemplateId, inline } = this.props;
    if (!inline) {
      dispatch(unloadItem('form-templates', formTemplateId));
    }
  }

  _load(props) {
    const { dispatch, formTemplate, formTemplateId, linkedForm } = props;
    if (!formTemplate) {
      const options = { new: true };
      if (linkedForm) {
        options.linkedFormId = linkedForm._id;
      }
      dispatch(loadItem('form-templates', formTemplateId, options));
    } else if (formTemplate.newForm) {
      this.setState({ form: { ...formTemplate.newForm } });
    }
  }

  _onAdd(event) {
    event.preventDefault();
    const { dispatch, formTemplate, history, linkedForm, onDone } = this.props;
    const { form } = this.state;
    const error = setFormError(formTemplate, form);

    if (error) {
      this.setState({ error });
    } else {
      finalizeForm(formTemplate, form, linkedForm);
      postItem('forms', form)
      .then((response) => {
        // if we didn't have a session and we created one as part of adding,
        // remember it.
        if (!haveSession() && response.session) {
          // console.log('!!! FormAdd set session', response);
          dispatch(setSession(response.session));
        }
        return response.form;
      })
      .then(formSaved => (onDone ? onDone(formSaved) : history.goBack()))
      .catch((error2) => {
        console.error('!!! FormAdd post error', error2);
        this.setState({ error: error2, showSignIn: error2.code === 'userExists' });
      })
      .catch(error2 => console.error('!!! FormAdd post 2', error2));
    }
  }

  _onChange(form) {
    const { formTemplate } = this.props;
    // clear any error for fields that have changed
    const error = clearFormError(formTemplate, form, this.state.error);
    this.setState({ form, error });
  }

  render() {
    const {
      className, onCancel, formTemplate, formTemplateId, full, history, inline,
      linkedForm, linkedFormTemplate, onLinkedForm, signInControl,
    } = this.props;
    const { error, form, showSignIn } = this.state;
    const classNames = ['form'];
    if (className) {
      classNames.push(className);
    }

    let result;
    if (formTemplate && form) {
      let cancelControl;
      let headerCancelControl;
      if (onCancel || (formTemplateId && !inline)) {
        const cancelFunc = onCancel || (() => history.goBack());
        cancelControl = (
          <Button secondary={true} label="Cancel" onClick={cancelFunc} />
        );
        headerCancelControl = [
          <button key="cancel"
            type="button"
            className="button"
            onClick={cancelFunc}>
            Cancel
          </button>,
        ];
      }

      let header;
      if (!inline) {
        header = (
          <PageHeader title={formTemplate.name} actions={headerCancelControl} />
        );
      }

      let signIn;
      if (showSignIn && signInControl) {
        signIn = signInControl;
      }

      let linkedFormControl;
      if (linkedForm && linkedFormTemplate) {
        if (!inline) {
          linkedFormControl = (
            <span className="form__link">
              from <Link to={`/forms/${linkedForm._id}/edit`}>
                {linkedFormTemplate.name}
              </Link>
            </span>
          );
        } else {
          linkedFormControl = (
            <span className="form__link">
              from <a onClick={() => onLinkedForm(linkedForm)}>
                {linkedFormTemplate.name}
              </a>
            </span>
          );
        }
      }

      result = (
        <form className={classNames.join(' ')}
          action={'/forms'}
          onSubmit={this._onAdd}>
          {header}
          <FormContents form={form}
            formTemplate={formTemplate}
            linkedForm={linkedForm}
            linkedFormControl={linkedFormControl}
            full={full}
            onChange={this._onChange}
            error={error} />
          <footer className="form__footer">
            <button type="submit" className="button">
              {formTemplate.submitLabel || 'Submit'}
            </button>
            {cancelControl}
            {signIn}
          </footer>
        </form>
      );
    } else {
      result = <Loading />;
    }
    return result;
  }
}

FormAdd.propTypes = {
  className: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  formTemplateId: PropTypes.string.isRequired,
  formTemplate: PropTypes.object,
  full: PropTypes.bool,
  history: PropTypes.any,
  inline: PropTypes.bool,
  linkedForm: PropTypes.object,
  linkedFormTemplate: PropTypes.object,
  onCancel: PropTypes.func,
  onDone: PropTypes.func,
  onLinkedForm: PropTypes.func,
  signInControl: PropTypes.element,
};

FormAdd.defaultProps = {
  className: undefined,
  formTemplate: undefined,
  full: true,
  history: undefined,
  inline: false,
  linkedForm: undefined,
  linkedFormTemplate: undefined,
  location: undefined,
  onCancel: undefined,
  onDone: undefined,
  onLinkedForm: undefined,
  signInControl: undefined,
};

const select = (state, props) => {
  const query = props.location ? searchToObject(props.location.search) : {};
  const formTemplateId = props.formTemplateId || query.formTemplateId;
  return {
    formTemplateId,
    formTemplate: props.formTemplate || state[formTemplateId],
    linkedForm: props.linkedForm,
    linkedFormTemplate: props.linkedFormTemplate,
    notFound: state.notFound[formTemplateId],
  };
};

export default connect(select)(FormAdd);
