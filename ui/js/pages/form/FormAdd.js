
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { getItem, postItem, haveSession, setSession } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import { searchToObject } from '../../utils/Params';
import FormContents from './FormContents';
import { setFormError, clearFormError, finalizeForm } from './FormUtils';

class FormAdd extends Component {

  constructor(props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._onChange = this._onChange.bind(this);
    this.state = {};
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { formTemplateId } = nextProps;
    if (formTemplateId !== this.props.formTemplateId) {
      this._load(nextProps);
    }
  }

  _load(props) {
    const { session, linkedForm } = props;
    const { router } = this.context;
    const query = searchToObject(router.route.location.search);
    const formTemplateId = props.formTemplateId || query.formTemplateId;
    getItem('form-templates', formTemplateId, { totals: true })
    .then((formTemplate) => {
      const form = {
        fields: [],
        formTemplateId: formTemplate._id,
        linkedFormId: (linkedForm ? linkedForm._id : undefined),
      };
      formTemplate.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (session && field.linkToUserProperty) {
            // pre-fill out fields from session user
            form.fields.push({
              templateFieldId: field._id,
              value: session.userId[field.linkToUserProperty],
            });
          }

          // pre-fill out fields with a minimum value
          if (field.min) {
            form.fields.push({ templateFieldId: field._id, value: field.min });
          }
        });
      });

      this.setState({ form, formTemplate });
    })
    .catch(error => console.error('!!! FormAdd catch', error));
  }

  _onAdd(event) {
    event.preventDefault();
    const { linkedForm, onDone } = this.props;
    const { formTemplate, form } = this.state;
    const { router } = this.context;
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
          setSession(response.session);
        }
        return response.form;
      })
      .then(formSaved => (onDone ? onDone(formSaved) : router.history.goBack()))
      .catch((error2) => {
        console.error('!!! FormAdd post error', error2);
        this.setState({ error: error2, showSignIn: error2.code === 'userExists' });
      })
      .catch(error2 => console.error('!!! FormAdd post 2', error2));
    }
  }

  _onChange(form) {
    const { formTemplate } = this.state;
    // clear any error for fields that have changed
    const error = clearFormError(formTemplate, form, this.state.error);
    this.setState({ form, error });
  }

  render() {
    const {
      className, onCancel, full, inline, linkedForm, location,
      onLinkedForm, signInControl,
    } = this.props;
    const { error, form, formTemplate, showSignIn } = this.state;
    const { router } = this.context;
    const classNames = ['form'];
    if (className) {
      classNames.push(className);
    }

    let result;
    if (formTemplate && form) {
      const query = searchToObject(router.route.location.search);
      let cancelControl;
      let headerCancelControl;
      if (onCancel || (location && query.formTemplateId)) {
        const cancelFunc = onCancel || (() => router.history.goBack());
        cancelControl = (
          <Button secondary={true} label="Cancel" onClick={cancelFunc} />
        );
        headerCancelControl = [
          <button key="cancel" type="button" className="button"
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
        <form className={classNames.join(' ')} action={'/forms'}
          onSubmit={this._onAdd}>
          {header}
          <FormContents form={form} formTemplate={formTemplate}
            linkedForm={linkedForm} linkedFormControl={linkedFormControl}
            full={full} onChange={this._onChange} error={error} />
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
  formTemplateId: PropTypes.string,
  full: PropTypes.bool,
  inline: PropTypes.bool,
  linkedForm: PropTypes.object,
  location: PropTypes.object,
  onCancel: PropTypes.func,
  onDone: PropTypes.func,
  onLinkedForm: PropTypes.func,
  session: PropTypes.object,
  signInControl: PropTypes.element,
};

FormAdd.defaultProps = {
  className: undefined,
  formTemplateId: undefined,
  full: true,
  inline: false,
  linkedForm: undefined,
  location: undefined,
  onCancel: undefined,
  onDone: undefined,
  onLinkedForm: undefined,
  session: undefined,
  signInControl: undefined,
};

FormAdd.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  session: state.session,
});

export default Stored(FormAdd, select);
