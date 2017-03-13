import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { postSession } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import Button from '../../components/Button';
import FormState from '../../utils/FormState';

const TITLE = 'Sign In';

export default class SignIn extends Component {

  constructor(props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSignIn = this._onSignIn.bind(this);
    this._setSession = this._setSession.bind(this);
    const session = { email: '', password: '' };
    this.state = { formState: new FormState(session, this._setSession) };
  }

  componentDidMount() {
    const { inline } = this.props;
    if (!inline) {
      document.title = TITLE;
    }
    this._emailRef.focus();
  }

  _onCancel() {
    this.context.router.push('/');
  }

  _onSignIn(event) {
    const { inline } = this.props;
    event.preventDefault();
    postSession(this.state.formState.object)
      .then(() => {
        if (!inline) {
          this.context.router.push('/');
        }
      })
      .catch(error => this.setState({ error }));
  }

  _setSession(session) {
    this.setState({ formState: new FormState(session, this._setSession) });
  }

  render() {
    const { inline, onCancel, onSignUp, onVerifyEmail } = this.props;
    const { formState, error } = this.state;
    const session = formState.object;
    const classNames = ['form__container'];
    if (inline) {
      classNames.push('form__container--inline');
    }

    let header;
    let footerCancelControl;
    let verifyEmailControl;
    let signUpControl;
    if (inline) {
      header = <div className="form__text"><h2>{TITLE}</h2></div>;
      footerCancelControl = (
        <Button secondary={true} label="Cancel" onClick={onCancel} />
      );
      verifyEmailControl = <a onClick={onVerifyEmail}>Forgot password?</a>;
      signUpControl = (
        <Button secondary={true} label="Sign up" onClick={onSignUp} />
      );
    } else {
      const actions = [
        <button key="cancel" type="button" className="button"
          onClick={this._onCancel}>
          Cancel
        </button>,
      ];
      header = <PageHeader title={TITLE} actions={actions} />;
      verifyEmailControl = <Link to="/verify-email">Forgot password?</Link>;
      signUpControl = (
        <Button secondary={true} label="Sign up" path="/sign-up" />
      );
    }

    return (
      <div className={classNames.join(' ')}>
        <form className="form" action="/api/sessions" onSubmit={this._onSignIn}>
          {header}
          <FormError message={error} />
          <div className="form__contents">
            <fieldset className="form__fields">
              <FormField name="email" label="Email">
                <input ref={(ref) => { this._emailRef = ref; }}
                  name="email" type="email"
                  value={session.email || ''}
                  onChange={formState.change('email')} />
              </FormField>
              <FormField name="password" label="Password">
                <input name="password" type="password"
                  value={session.password || ''}
                  onChange={formState.change('password')} />
              </FormField>
            </fieldset>
          </div>
          <div className="form__footer-container">
            <footer className="form__footer">
              <button type="submit" className="button" onClick={this._onSignIn}>
                Sign In
              </button>
              {footerCancelControl}
            </footer>
            <footer className="form__footer">
              {verifyEmailControl}
            </footer>
            <div className="form__footer-separator">
              <span>or</span>
            </div>
            <footer className="form__footer">
              {signUpControl}
            </footer>
          </div>
        </form>
      </div>
    );
  }
}

SignIn.propTypes = {
  inline: PropTypes.bool,
  onCancel: PropTypes.func,
  onSignUp: PropTypes.func,
  onVerifyEmail: PropTypes.func,
};

SignIn.defaultProps = {
  inline: false,
  onCancel: undefined,
  onSignUp: undefined,
  onVerifyEmail: undefined,
};

SignIn.contextTypes = {
  router: PropTypes.any,
};
