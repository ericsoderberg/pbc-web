"use strict";
import React, { Component, PropTypes } from 'react';
import { postSession } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';

export default class SignIn extends Component {

  constructor (props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSignIn = this._onSignIn.bind(this);
    this._onChange = this._onChange.bind(this);
    this.state = { session: { email: '', password: '' } };
  }

  _onCancel () {
    this.context.router.goBack();
  }

  _onSignIn (event) {
    event.preventDefault();
    postSession(this.state.session)
      .then(response => this.context.router.goBack())
      .catch(error => this.setState({ error: error }));
  }

  _onChange (propertyName) {
    return (event => {
      let session = { ...this.state.session };
      session[propertyName] = event.target.value;
      this.setState({ session: session });
    });
  }

  render () {
    const { session, errors } = this.state;
    const cancelControl = (
      <button className="button--header" type="button" onClick={this._onCancel}>
        Cancel
      </button>
    );
    return (
      <form className="form" action="/api/sessions" onSubmit={this._onSignIn}>
        <PageHeader title="Sign In" actions={cancelControl} />
        {errors}
        <fieldset className="form__fields">
          <FormField name="email" label="Email">
            <input name="email" value={session.email || ''}
              onChange={this._onChange('email')}/>
          </FormField>
          <FormField name="password" label="Password">
            <input name="password" type="password" value={session.password || ''}
              onChange={this._onChange('password')}/>
          </FormField>
        </fieldset>
        <footer className="form__footer">
          <button type="submit" onClick={this._onSignIn}>Sign In</button>
        </footer>
      </form>
    );
  }
};

SignIn.contextTypes = {
  router: PropTypes.any
};
