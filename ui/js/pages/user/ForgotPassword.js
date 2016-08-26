"use strict";
import React, { Component, PropTypes } from 'react';
import { postForgotPassword } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import Button from '../../components/Button';

const EMAIL_REGEXP = /.+@.+/;

export default class ForgotPassword extends Component {

  constructor (props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSendLink = this._onSendLink.bind(this);
    this.state = {
      email: '',
      errors: {}
    };
  }

  componentDidMount () {
    this.refs.email.focus();
  }

  _onCancel () {
    this.context.router.goBack();
  }

  _onSendLink (event) {
    event.preventDefault();
    if (! this.state.email) {
      this.setState({ errors: { email: 'required' } });
    } else if (! EMAIL_REGEXP.test(this.state.email)) {
      this.setState({ errors: { email: 'not an email address' } });
    } else {
      postForgotPassword(this.state.email)
      .then(response => this.context.router.replace('/sign-in'))
      .catch(error => this.setState({ errorMessage: error.error }));
    }
  }

  render () {
    const { email, errorMessage, errors } = this.state;

    const cancelControl = (
      <button className="button-header" type="button" onClick={this._onCancel}>
        Cancel
      </button>
    );

    return (
      <div className="form__container">
        <form className="form" action="/api/users/sign-up" onSubmit={this._onSignUp}>
          <PageHeader title="Forgot Password" actions={cancelControl} />
          <FormError message={errorMessage} />
          <fieldset className="form__fields">
            <div className="form__text">
              <p>We will send instructions to reset your password to this email
              address.</p>
            </div>
            <FormField name="email" label="Email" error={errors.email}>
              <input ref="email" name="email" value={email}
                onChange={(event) => this.setState({
                  email: event.target.value, errors: {} })}/>
            </FormField>
          </fieldset>
          <footer className="form__footer">
            <button type="submit" className="button" onClick={this._onSendLink}>
              Send Instructions
            </button>
            <Button path="/sign-in" secondary={true}>
              Sign In
            </Button>
          </footer>
        </form>
      </div>
    );
  }
};

ForgotPassword.contextTypes = {
  router: PropTypes.any
};
