import React, { Component, PropTypes } from 'react';
import { postSignUp } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import Button from '../../components/Button';
import FormState from '../../utils/FormState';

const TITLE = 'Sign Up';

export default class SignUp extends Component {

  constructor(props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSignUp = this._onSignUp.bind(this);
    this._setUser = this._setUser.bind(this);
    const user = { name: '', email: '', password: '' };
    this.state = {
      formState: new FormState(user, this._setUser),
      errors: {},
    };
  }

  componentDidMount() {
    const { inline } = this.props;
    if (!inline) {
      document.title = TITLE;
    }
    this._nameRef.focus();
  }

  _onCancel() {
    const { router } = this.context;
    router.history.goBack();
  }

  _errorToState(error) {
    const result = {};
    if (error) {
      if (error.errmsg) {
        result.errorMessage = error.errmsg;
      } else if (error.errors) {
        result.errors = {};
        Object.keys(error.errors).forEach((name) => {
          const err = error.errors[name];
          const propName = (name === 'encryptedPassword') ? 'password' : name;
          if (err.kind === 'required') {
            result.errors[propName] = 'required';
          }
        });
      }
    }
    return result;
  }

  _onSignUp(event) {
    const { inline } = this.props;
    const { router } = this.context;
    event.preventDefault();
    postSignUp(this.state.formState.object)
      .then(() => {
        if (!inline) {
          router.history.push('/');
        }
      })
      .catch(error => this.setState(this._errorToState(error)))
      .catch(error => console.error('!!! SignUp catch', error));
  }

  _setUser(user) {
    this.setState({ formState: new FormState(user, this._setUser) });
  }

  render() {
    const { inline, onCancel, onSignIn } = this.props;
    const { formState, errorMessage, errors } = this.state;
    const user = formState.object;
    const classNames = ['form__container'];
    if (inline) {
      classNames.push('form__container--inline');
    }

    let header;
    let footerCancelControl;
    let signInControl;
    if (inline) {
      header = <div className="form__text"><h2>{TITLE}</h2></div>;
      footerCancelControl = (
        <Button secondary={true} label="Cancel" onClick={onCancel} />
      );
      signInControl = (
        <Button secondary={true} label="Sign in" onClick={onSignIn} />
      );
    } else {
      const actions = [
        <button key="cancel" type="button" className="button"
          onClick={this._onCancel}>
          Cancel
        </button>,
      ];
      header = <PageHeader title={TITLE} actions={actions} />;
      signInControl = (
        <Button secondary={true} label="Sign in" path="/sign-in" />
      );
    }

    return (
      <div className={classNames.join(' ')}>
        <form className="form" action="/api/users/sign-up"
          onSubmit={this._onSignUp}>
          {header}
          <FormError message={errorMessage} />
          <div className="form__contents">
            <fieldset className="form__fields">
              <FormField name="name" label="Name" error={errors.name}>
                <input ref={(ref) => { this._nameRef = ref; }} name="name"
                  value={user.name || ''}
                  onChange={formState.change('name')} />
              </FormField>
              <FormField name="email" label="Email" error={errors.email}>
                <input name="email" value={user.email || ''}
                  onChange={formState.change('email')} />
              </FormField>
              <FormField name="password" label="Password"
                error={errors.password}>
                <input name="password" type="password"
                  value={user.password || ''}
                  onChange={formState.change('password')} />
              </FormField>
            </fieldset>
          </div>
          <div className="form__footer-container">
            <footer className="form__footer">
              <button type="submit" className="button" onClick={this._onSignUp}>
                Sign Up
              </button>
              {footerCancelControl}
            </footer>
            <div className="form__footer-separator">
              <span>or</span>
            </div>
            <footer className="form__footer">
              {signInControl}
            </footer>
          </div>
        </form>
      </div>
    );
  }
}

SignUp.propTypes = {
  inline: PropTypes.bool,
  onCancel: PropTypes.func,
  onSignIn: PropTypes.func,
};

SignUp.defaultProps = {
  inline: undefined,
  onCancel: undefined,
  onSignIn: undefined,
};

SignUp.contextTypes = {
  router: PropTypes.any,
};
