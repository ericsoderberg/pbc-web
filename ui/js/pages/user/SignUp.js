"use strict";
import React, { Component, PropTypes } from 'react';
import { postSignUp } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';

export default class SignUp extends Component {

  constructor (props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSignUp = this._onSignUp.bind(this);
    this._onChange = this._onChange.bind(this);
    this.state = { user: { name: '', email: '', password: '' } };
  }

  componentDidMount () {
    this.refs.email.focus();
  }

  _onCancel () {
    this.context.router.goBack();
  }

  _onSignUp (event) {
    event.preventDefault();
    postSignUp(this.state.user)
      .then(response => this.context.router.goBack())
      .catch(error => this.setState({ error: error }));
  }

  _onChange (propertyName) {
    return (event => {
      let user = { ...this.state.user };
      user[propertyName] = event.target.value;
      this.setState({ user: user });
    });
  }

  render () {
    const { user, error } = this.state;
    const cancelControl = (
      <button className="button--header" type="button" onClick={this._onCancel}>
        Cancel
      </button>
    );
    return (
      <form className="form" action="/api/users/sign-up" onSubmit={this._onSignIn}>
        <PageHeader title="Sign Up" actions={cancelControl} />
        <FormError message={error} />
        <fieldset className="form__fields">
          <FormField name="name" label="Name">
            <input name="name" value={user.name || ''}
              onChange={this._onChange('name')}/>
          </FormField>
          <FormField name="email" label="Email">
            <input ref="email" name="email" value={user.email || ''}
              onChange={this._onChange('email')}/>
          </FormField>
          <FormField name="password" label="Password">
            <input name="password" type="password" value={user.password || ''}
              onChange={this._onChange('password')}/>
          </FormField>
        </fieldset>
        <footer className="form__footer">
          <button type="submit" onClick={this._onSignUp}>Sign Up</button>
        </footer>
      </form>
    );
  }
};

SignUp.contextTypes = {
  router: PropTypes.any
};
