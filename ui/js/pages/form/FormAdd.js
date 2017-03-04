
import React, { Component, PropTypes } from 'react';
import { getItem, postItem, haveSession, setSession } from '../../actions';
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
    this.state = {
      form: {
        fields: [],
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
    const formTemplateId =
      props.formTemplateId || props.location.query.formTemplateId;
    const session = props.session;
    getItem('form-templates', formTemplateId)
    .then((formTemplate) => {
      const fields = [];
      formTemplate.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (session) {
            // pre-fill out name and email from session, if possible
            if (field.name === 'Name') {
              fields.push({ templateFieldId: field._id, value: session.name });
            } else if (field.name === 'Email') {
              fields.push({ templateFieldId: field._id, value: session.email });
            }
          }
          // pre-fill out fields with a minimum value
          if (field.min) {
            fields.push({ templateFieldId: field._id, value: field.min });
          }
        });
      });

      this.setState({
        form: { fields, formTemplateId: formTemplate._id },
        formTemplate,
      });
    })
    .catch(error => console.error('!!! FormAdd catch', error));
  }

  _onAdd(event) {
    event.preventDefault();
    const { onDone } = this.props;
    const { formTemplate, form } = this.state;
    const error = setFormError(formTemplate, form);

    if (error) {
      this.setState({ error });
    } else {
      finalizeForm(formTemplate, form);
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
    const { className, onCancel, full, inline } = this.props;
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
  formTemplateId: PropTypes.string.isRequired,
  full: PropTypes.bool,
  inline: PropTypes.bool,
  location: PropTypes.shape({
    query: PropTypes.shape({
      formTemplateId: PropTypes.string,
    }),
  }),
  onCancel: PropTypes.func,
  onDone: PropTypes.func.isRequired,
};

FormAdd.defaultProps = {
  className: undefined,
  full: true,
  inline: false,
  location: undefined,
  onCancel: undefined,
};

FormAdd.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  session: state.session,
});

export default Stored(FormAdd, select);
