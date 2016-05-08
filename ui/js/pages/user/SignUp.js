"use strict";
import React, { Component, PropTypes } from 'react';
import { postSignUp } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import FormState from '../../utils/FormState';

export default class SignUp extends Component {

  constructor (props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSignUp = this._onSignUp.bind(this);
    this._setUser = this._setUser.bind(this);
    const user = { name: '', email: '', password: '' };
    this.state = { formState: new FormState(user, this._setUser) };
  }

  componentDidMount () {
    this.refs.name.focus();
  }

  _onCancel () {
    this.context.router.goBack();
  }

  _onSignUp (event) {
    event.preventDefault();
    postSignUp(this.state.formState.object)
      .then(response => this.context.router.goBack())
      .catch(error => this.setState({ error: error }));
  }

  _setUser (user) {
    this.setState({ formState: new FormState(user, this._setUser) });
  }

  render () {
    const { formState, error } = this.state;
    const user = formState.object;

    const cancelControl = (
      <button className="button--header" type="button" onClick={this._onCancel}>
        Cancel
      </button>
    );

    return (
      <div className="form__container">
        <form className="form" action="/api/users/sign-up" onSubmit={this._onSignUp}>
          <PageHeader title="Sign Up" actions={cancelControl} />
          <FormError message={error} />
          <fieldset className="form__fields">
            <FormField name="name" label="Name">
              <input ref="name" name="name" value={user.name || ''}
                onChange={formState.change('name')}/>
            </FormField>
            <FormField name="email" label="Email">
              <input name="email" value={user.email || ''}
                onChange={formState.change('email')}/>
            </FormField>
            <FormField name="password" label="Password">
              <input name="password" type="password" value={user.password || ''}
                onChange={formState.change('password')}/>
            </FormField>
          </fieldset>
          <footer className="form__footer">
            <button type="submit" onClick={this._onSignUp}>Sign Up</button>
          </footer>
        </form>
      </div>
    );
  }
};

SignUp.contextTypes = {
  router: PropTypes.any
};
