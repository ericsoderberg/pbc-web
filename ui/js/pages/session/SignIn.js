"use strict";
import React, { Component, PropTypes } from 'react';
import { postSession } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import Button from '../../components/Button';
import FormState from '../../utils/FormState';

export default class SignIn extends Component {

  constructor (props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSignIn = this._onSignIn.bind(this);
    this._setSession = this._setSession.bind(this);
    const session = { email: '', password: '' };
    this.state = { formState: new FormState(session, this._setSession) };
  }

  componentDidMount () {
    this.refs.email.focus();
  }

  _onCancel () {
    this.context.router.push('/');
  }

  _onSignIn (event) {
    event.preventDefault();
    postSession(this.state.formState.object)
      .then(response => this.context.router.push('/'))
      .catch(error => this.setState({ error: error }));
  }

  _setSession (session) {
    this.setState({ formState: new FormState(session, this._setSession) });
  }

  render () {
    const { formState, error } = this.state;
    const session = formState.object;

    const cancelControl = (
      <button className="button-header" type="button" onClick={this._onCancel}>
        Cancel
      </button>
    );

    return (
      <div className="form__container">
        <form className="form" action="/api/sessions" onSubmit={this._onSignIn}>
          <PageHeader title="Sign In" actions={cancelControl} />
          <FormError message={error} />
          <fieldset className="form__fields">
            <FormField name="email" label="Email">
              <input ref="email" name="email" value={session.email || ''}
                onChange={formState.change('email')}/>
            </FormField>
            <FormField name="password" label="Password">
              <input name="password" type="password" value={session.password || ''}
                onChange={formState.change('password')}/>
            </FormField>
          </fieldset>
          <footer className="form__footer">
            <button type="submit" className="button" onClick={this._onSignIn}>
              Sign In
            </button>
            <Button path="/verify-email" secondary={true} replaceHistory={true}>
              Sign In Via Email
            </Button>
            <Button path="/sign-up" secondary={true}>
              Sign Up
            </Button>
          </footer>
        </form>
      </div>
    );
  }
};

SignIn.contextTypes = {
  router: PropTypes.any
};
