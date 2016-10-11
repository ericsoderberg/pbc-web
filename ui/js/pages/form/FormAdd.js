"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, postItem, haveSession, setSession } from '../../actions';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import FormContents from './FormContents';
import FormTotal from './FormTotal';
import { setFormError, clearFormError, finalizeForm } from './FormUtils';

class FormAdd extends Component {

  constructor (props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._onChange = this._onChange.bind(this);
    this.state = {
      form: {
        fields: []
      }
    };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.formTemplateId !== this.props.formTemplateId) {
      this._load(nextProps);
    }
  }

  _load (props) {
    const formTemplateId =
      props.formTemplateId || props.location.query.formTemplateId;
    const session = props.session;
    getItem('form-templates', formTemplateId)
    .then(formTemplate => {
      let fields = [];
      // pre-fill out name and email from session, if possible
      if (session) {
        formTemplate.sections.forEach(section => {
          section.fields.forEach(field => {
            if ('Name' === field.name) {
              fields.push({ templateFieldId: field._id, value: session.name });
            } else if ('Email' === field.name) {
              fields.push({ templateFieldId: field._id, value: session.email });
            }
          });
        });
      }
      this.setState({
        form: { fields: fields, formTemplateId: formTemplate._id },
        formTemplate: formTemplate
      });
    })
    .catch(error => console.log("!!! FormAdd catch", error));
  }

  _onAdd (event) {
    event.preventDefault();
    const { onDone } = this.props;
    const { formTemplate, form } = this.state;
    const error = setFormError(formTemplate, form);

    if (error) {
      this.setState({ error: error });
    } else {
      finalizeForm(formTemplate, form);
      postItem('forms', form)
      .then(response => {
        // if we didn't have a session and we created one as part of adding,
        // remember it.
        if (! haveSession() && response.token) {
          console.log('!!! FormAdd set session', response);
          setSession(response);
        }
        return {};
      })
      .then(response => onDone ? onDone() : this.context.router.goBack())
      .catch(error => {
        console.log('!!! FormAdd post error', error);
        this.setState({ error: error });
      })
      .catch(error => console.log('!!! FormAdd post 2', error));
    }
  }

  _onChange (form) {
    const { formTemplate } = this.state;
    // clear any error for fields that have changed
    const error = clearFormError(formTemplate, form, this.state.error);
    this.setState({ form: form, error: error });
  }

  render () {
    const { onCancel, full } = this.props;
    const { form, formTemplate, error } = this.state;
    let classNames = ['form'];
    if (this.props.className) {
      classNames.push(this.props.className);
    }

    let result;
    if (formTemplate) {

      let cancelControl;
      if (onCancel) {
        cancelControl = (
          <Button secondary={true} label="Cancel" onClick={onCancel} />
        );
      } else if (this.props.location &&
        this.props.location.query.formTemplateId) {
        cancelControl = (
          <Button secondary={true} label="Cancel"
            onClick={() => this.context.router.goBack()} />
        );
      }

      let total;
      if (formTemplate.payable) {
        total = <FormTotal form={form} formTemplate={formTemplate} />;
      }

      result = (
        <form className={classNames.join(' ')} action={'/forms'}
          onSubmit={this._onAdd}>
          <FormContents form={form} formTemplate={formTemplate}
            full={full} onChange={this._onChange} error={error} />
          <footer className="form__footer">
            <button type="submit" className="button">
              {formTemplate.submitLabel || 'Submit'}
            </button>
            {total}
            {cancelControl}
          </footer>
        </form>
      );

    } else {
      result = <Loading />;
    }
    return result;
  }
};

FormAdd.propTypes = {
  formTemplateId: PropTypes.string,
  formTemplate: PropTypes.object,
  full: PropTypes.bool,
  onCancel: PropTypes.func,
  onDone: PropTypes.func
};

FormAdd.defaultProps = {
  full: true
};

FormAdd.contextTypes = {
  router: PropTypes.any
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(FormAdd, select);
