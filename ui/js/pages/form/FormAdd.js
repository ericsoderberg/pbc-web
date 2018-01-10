
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

const MESSAGE = {
  Register: 'Registered',
  'Sign Up': 'Signed up',
  Submit: 'Submitted',
  Subscribe: 'Subscribed',
};

class FormAdd extends Component {

  constructor(props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._onChange = this._onChange.bind(this);
    this.state = {};
    if (props.formTemplate) {
      this.state.form = {
        ...(props.form || props.formTemplate.newForm || { fields: [] }),
      };
    }
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { formTemplateId, formTemplate } = nextProps;
    if (formTemplateId !== this.props.formTemplateId || !formTemplate) {
      this.setState({ form: undefined });
      this._load(nextProps);
    } else if (formTemplate && !this.state.form) {
      this.setState({ form: { ...(nextProps.form || formTemplate.newForm) } });
    }
  }

  componentWillUnmount() {
    const { dispatch, formTemplateId, inline } = this.props;
    if (!inline) {
      dispatch(unloadItem('form-templates', formTemplateId));
    }
  }

  _load(props) {
    const {
      dispatch, form, formTemplate, formTemplateId, inline, linkedForm,
    } = props;
    if (!formTemplate) {
      const options = { new: true, totals: true, preFill: inline };
      if (linkedForm) {
        options.linkedFormId = linkedForm._id;
      }
      dispatch(loadItem('form-templates', formTemplateId, options));
    } else if (form) {
      this.setState({ form });
    } else if (formTemplate.newForm) {
      this.setState({ form: { ...formTemplate.newForm } });
    }
  }

  _onAdd(event) {
    event.preventDefault();
    const {
      dispatch, formTemplate, history, linkedForm, onDone, onSignIn,
    } = this.props;
    const { form, kiosk } = this.state;
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
        .then((formSaved) => {
          if (kiosk) {
            this.setState({ submitted: true });
          } else if (onDone) {
            onDone(formSaved);
          } else {
            history.goBack();
          }
        })
        .catch((error2) => {
          if (error2.code === 'userExists' && onSignIn) {
            // The form had an email address tied to the session but
            // either the current user isn't signed in or is signed in with
            // a different account. Typical case is not signed in.
            onSignIn(form);
          } else {
            this.setState({ error: error2, showSignIn: error2.code === 'userExists' });
          }
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
    const {
      error, form, kiosk, showSignIn, submitted,
    } = this.state;
    const classNames = ['form'];
    if (kiosk) {
      classNames.push('form--kiosk');
    }
    if (className) {
      classNames.push(className);
    }

    let result;
    if (kiosk && submitted) {
      result = (
        <div className="form form--kiosk">
          <PageHeader title={formTemplate.name} />
          <div className="form__text">
            <h2>{MESSAGE[formTemplate.submitLabel] || MESSAGE.Submit}!</h2>
            {formTemplate.postSubmitMessage}
          </div>
          <footer className="form__footer">
            <button type="button"
              className="button"
              onClick={() => {
                this.setState({
                  form: formTemplate.newForm,
                  submitted: false,
                });
              }}>
              Done
            </button>
          </footer>
        </div>
      );
    } else if (formTemplate && form) {
      let cancelControl;
      const actions = [];
      if (kiosk) {
        actions.push((
          <button key="close"
            type="button"
            className="button"
            onClick={() => history.goBack()}>
            Close
          </button>
        ));
      } else {
        actions.push((
          <button key="kiosk"
            type="button"
            className="button"
            onClick={() => this.setState({ kiosk: true })}>
            Kiosk
          </button>
        ));
        if (onCancel || (formTemplateId && !inline)) {
          const cancelFunc = onCancel || (() => history.goBack());
          cancelControl = (
            <Button secondary={true} label="Cancel" onClick={cancelFunc} />
          );
          actions.push((
            <button key="cancel"
              type="button"
              className="button"
              onClick={cancelFunc}>
              Cancel
            </button>
          ));
        }
      }

      let header;
      if (!inline) {
        header = (
          <PageHeader title={formTemplate.name} actions={actions} />
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
          action="/forms"
          onSubmit={this._onAdd}
          noValidate={true}>
          {header}
          <FormContents form={form}
            formTemplate={formTemplate}
            linkedForm={linkedForm}
            linkedFormControl={linkedFormControl}
            full={full}
            kiosk={kiosk}
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
  form: PropTypes.object, // if add needs sign in, re-use what was filled out already
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
  onSignIn: PropTypes.func,
  signInControl: PropTypes.element,
};

FormAdd.defaultProps = {
  className: undefined,
  form: undefined,
  formTemplate: undefined,
  full: true,
  history: undefined,
  inline: false,
  linkedForm: undefined,
  linkedFormTemplate: undefined,
  // location: undefined,
  onCancel: undefined,
  onDone: undefined,
  onLinkedForm: undefined,
  onSignIn: undefined,
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
