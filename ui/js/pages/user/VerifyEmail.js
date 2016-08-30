"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { postVerifyEmail, postSessionViaToken } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import Button from '../../components/Button';
import Stored from '../../components/Stored';

const EMAIL_REGEXP = /.+@.+/;

class VerifyEmail extends Component {

  constructor (props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSendLink = this._onSendLink.bind(this);
    this.state = {
      email: '',
      errors: {},
      state: 'prompt'
    };
  }

  componentDidMount () {
    const temporaryToken = this.props.location.query.token;
    if (temporaryToken) {
      postSessionViaToken({ token: this.props.location.query.token })
      .then(session => this.setState({ state: 'done' }))
      .catch(error => {
        console.log('!!! Reset catch', error);
        this.setState({ state: 'prompt', errorMessage: error });
      });
    } else {
      this.refs.email.focus();
    }
  }

  _onCancel () {
    this.context.router.push('/');
  }

  _onSendLink (event) {
    event.preventDefault();
    if (! this.state.email) {
      this.setState({ errors: { email: 'required' } });
    } else if (! EMAIL_REGEXP.test(this.state.email)) {
      this.setState({ errors: { email: 'not an email address' } });
    } else {
      postVerifyEmail(this.state.email)
      .then(response => this.setState({ state: 'pending' }))
      .catch(error => {
        console.log('!!! VerifyEmail error', error);
        this.setState({ state: 'prompt', errorMessage: error.error });
      });
    }
  }

  _renderForm () {
    const { email, errorMessage, errors } = this.state;

    const cancelControl = (
      <button className="button-header" type="button" onClick={this._onCancel}>
        Cancel
      </button>
    );

    return (
      <div className="form__container">
        <form className="form" action="/api/users/sign-up" onSubmit={this._onSignUp}>
          <PageHeader title="Verify Email" actions={cancelControl} />
          <FormError message={errorMessage} />
          <fieldset className="form__fields">
            <div className="form__text">
              <p>You can sign you via a link sent to your email
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
              Send Email
            </button>
            <Button path="/sign-in" secondary={true}>
              Sign In With Password
            </Button>
          </footer>
        </form>
      </div>
    );
  }

  _renderPending () {
    return (
      <div className="form__container">
        <div className="form">
          <PageHeader title="Verify Email" />
          <fieldset className="form__fields">
            <div className="form__text">
              We've sent you an email. Check your email for a message
              with the subject 'Verify Email' and click the link in it to sign in.
            </div>
          </fieldset>
          <footer className="form__footer">
            <Link to="/">Home</Link>
          </footer>
        </div>
      </div>
    );
  }

  _renderCheck () {
    return (
      <div className="form__container">
        <div className="form">
          <PageHeader title="Verify Email" />
          <fieldset className="form__fields">
            <div className="form__text">
              Verifying
            </div>
          </fieldset>
        </div>
      </div>
    );
  }

  _renderVerified () {
    const { session } = this.props;
    return (
      <div className="form__container">
        <div className="form">
          <PageHeader title="Verify Email" />
          <fieldset className="form__fields">
            <div className="form__text">
              Thanks for verifying your email {session.name}.
              You can set a password for your account or just use the site.
            </div>
            </fieldset>
          <footer className="form__footer">
            <Button path={`/users/${session.userId}/edit`} secondary={true}>
              Edit Account
            </Button>
            <Button path="/" secondary={true}>Home</Button>
          </footer>
        </div>
      </div>
    );
  }

  render () {
    const { state } = this.state;
    console.log('!!! VerifyEmail render', state);

    switch (state) {
      case 'prompt':
        return this._renderForm();
      case 'pending':
        return this._renderPending();
      case 'check':
        return this._renderCheck();
      case 'done':
        return this._renderVerified();
    }
  }

};

VerifyEmail.propTypes = {
  session: PropTypes.shape({
    name: PropTypes.string
  })
};

VerifyEmail.contextTypes = {
  router: PropTypes.any
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(VerifyEmail, select);
