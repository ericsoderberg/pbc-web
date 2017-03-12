
import React, { Component, PropTypes } from 'react';
import { getItem, getItems, postItem, haveSession, setSession,
  } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import FormContents from './FormContents';
import { setFormError, clearFormError, finalizeForm } from './FormUtils';

class FormAdd extends Component {

  constructor(props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._onChange = this._onChange.bind(this);
    const { linkedForm } = props;
    this.state = {
      form: {
        fields: [],
        linkedFormId: (linkedForm ? linkedForm._id : undefined),
      },
    };
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.formTemplateId !== this.props.formTemplateId) {
      this._load(nextProps);
    }
  }

  _load(props) {
    const { session } = props;
    const form = { ...this.state.form };
    const formTemplateId =
      props.formTemplateId || props.location.query.formTemplateId;
    getItem('form-templates', formTemplateId)
    .then((formTemplate) => {
      if (formTemplate.dependsOnId) {
        // get forms already filled out
        return getItems('forms', {
          formTemplateId: formTemplate.dependsOnId._id,
          userId: (form || session || {}).userId,
        })
        .then(dependedOnForms => ({ formTemplate, dependedOnForms }));
      }
      return { formTemplate };
    })
    .then((context) => {
      const { formTemplate } = context;
      form.formTemplateId = formTemplate._id;
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
    const error = setFormError(formTemplate, form);

    if (error) {
      this.setState({ error });
    } else {
      finalizeForm(formTemplate, form, linkedForm);
      postItem('forms', form)
      .then((response) => {
        // if we didn't have a session and we created one as part of adding,
        // remember it.
        if (!haveSession() && response.token) {
          // console.log('!!! FormAdd set session', response);
          setSession(response);
        }
        return {};
      })
      .then(() => (onDone ? onDone() : this.context.router.goBack()))
      .catch((error2) => {
        console.error('!!! FormAdd post error', error);
        this.setState({ error: error2 });
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
    const { className, onCancel, full, inline, linkedForm } = this.props;
    const { form, formTemplate, error } = this.state;
    const classNames = ['form'];
    if (className) {
      classNames.push(className);
    }

    let result;
    if (formTemplate) {
      let cancelControl;
      let headerCancelControl;
      if (onCancel || (this.props.location &&
        this.props.location.query.formTemplateId)) {
        const cancelFunc = onCancel || (() => this.context.router.goBack());
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

      result = (
        <form className={classNames.join(' ')} action={'/forms'}
          onSubmit={this._onAdd}>
          {header}
          <FormContents form={form} formTemplate={formTemplate}
            linkedForm={linkedForm}
            full={full} onChange={this._onChange} error={error} />
          <footer className="form__footer">
            <button type="submit" className="button">
              {formTemplate.submitLabel || 'Submit'}
            </button>
            {cancelControl}
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
  location: PropTypes.shape({
    query: PropTypes.shape({
      formTemplateId: PropTypes.string,
    }),
  }),
  onCancel: PropTypes.func,
  onDone: PropTypes.func,
  session: PropTypes.object,
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
  session: undefined,
};

FormAdd.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  session: state.session,
});

export default Stored(FormAdd, select);
