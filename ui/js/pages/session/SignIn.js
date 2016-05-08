"use strict";
import React, { Component, PropTypes } from 'react';
import { postSession } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import FormState from '../../utils/FormState';

export default class SignIn extends Component {

  constructor (props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSignIn = this._onSignIn.bind(this);
    this._onSignUp = this._onSignUp.bind(this);
    this._setSession = this._setSession.bind(this);
    const session = { email: '', password: '' };
    this.state = { formState: new FormState(session, this._setSession) };
  }

  componentDidMount () {
    this.refs.email.focus();
  }

  _onCancel () {
    this.context.router.goBack();
  }

  _onSignIn (event) {
    event.preventDefault();
    postSession(this.state.formState.object)
      .then(response => this.context.router.goBack())
      .catch(error => this.setState({ error: error }));
  }

  _onSignUp (event) {
    event.preventDefault();
    this.context.router.push('/sign-up');
  }

  _setSession (session) {
    this.setState({ formState: new FormState(session, this._setSession) });
  }

  render () {
    const { formState, error } = this.state;
    const session = formState.object;

    const cancelControl = (
      <button className="button--header" type="button" onClick={this._onCancel}>
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
            <button type="submit" onClick={this._onSignIn}>Sign In</button>
            <button onClick={this._onSignUp}>Sign Up</button>
          </footer>
        </form>
      </div>
    );
  }
};

SignIn.contextTypes = {
  router: PropTypes.any
};
