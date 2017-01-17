"use strict";
import React, { Component, PropTypes } from 'react';
import { postSignUp } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import Button from '../../components/Button';
import FormState from '../../utils/FormState';

export default class SignUp extends Component {

  constructor (props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSignUp = this._onSignUp.bind(this);
    this._setUser = this._setUser.bind(this);
    const user = { name: '', email: '', password: '' };
    this.state = {
      formState: new FormState(user, this._setUser),
      errors: {}
    };
  }

  componentDidMount () {
    document.title = 'Sign Up';
    this.refs.name.focus();
  }

  _onCancel () {
    this.context.router.goBack();
  }

  _errorToState (error) {
    let result = {};
    if (error) {
      if (error.errmsg) {
        result.errorMessage = error.errmsg;
      } else if (error.errors) {
        result.errors = {};
        Object.keys(error.errors).forEach(name => {
          const err = error.errors[name];
          if ('encryptedPassword' === name) {
            name = 'password';
          }
          if ('required' === err.kind) {
            result.errors[name] = 'required';
          }
        });
      }
    }
    return result;
  }

  _onSignUp (event) {
    event.preventDefault();
    postSignUp(this.state.formState.object)
      .then(response => this.context.router.goBack())
      .catch(error => this.setState(this._errorToState(error)))
      .catch(error => console.log('!!! SignUp catch', error));
  }

  _setUser (user) {
    this.setState({ formState: new FormState(user, this._setUser) });
  }

  render () {
    const { formState, errorMessage, errors } = this.state;
    const user = formState.object;

    const cancelControl = [
      <button key="cancel" type="button" className="button"
        onClick={this._onCancel}>
        Cancel
      </button>
    ];

    return (
      <div className="form__container">
        <form className="form" action="/api/users/sign-up"
          onSubmit={this._onSignUp}>
          <PageHeader title="Sign Up" actions={cancelControl} />
          <FormError message={errorMessage} />
          <fieldset className="form__fields">
            <FormField name="name" label="Name" error={errors.name}>
              <input ref="name" name="name" value={user.name || ''}
                onChange={formState.change('name')}/>
            </FormField>
            <FormField name="email" label="Email" error={errors.email}>
              <input name="email" value={user.email || ''}
                onChange={formState.change('email')}/>
            </FormField>
            <FormField name="password" label="Password" error={errors.password}>
              <input name="password" type="password" value={user.password || ''}
                onChange={formState.change('password')}/>
            </FormField>
          </fieldset>
          <footer className="form__footer">
            <button type="submit" className="button" onClick={this._onSignUp}>
              Sign Up
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

SignUp.contextTypes = {
  router: PropTypes.any
};
