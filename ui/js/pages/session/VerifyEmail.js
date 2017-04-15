import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { postVerifyEmail, postSessionViaToken } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import Button from '../../components/Button';
import Stored from '../../components/Stored';
import { searchToObject } from '../../utils/Params';

const TITLE = 'Verify Email';
const EMAIL_REGEXP = /.+@.+/;

const Wrapper = (props) => {
  const { children, inline } = props;
  const classNames = ['form__container'];
  if (inline) {
    classNames.push('form__container--inline');
  }
  let header;
  if (inline) {
    header = <div className="form__text"><h2>{TITLE}</h2></div>;
  } else {
    header = <PageHeader title={TITLE} />;
  }
  return (
    <div className={classNames.join(' ')}>
      <div className="form">
        {header}
        {children}
      </div>
    </div>
  );
};

Wrapper.propTypes = {
  children: PropTypes.any.isRequired,
  inline: PropTypes.bool.isRequired,
};

const Verified = (props) => {
  const { inline, returnPath, session } = props;
  let homeControl;
  if (!inline) {
    homeControl = <Button path={returnPath} secondary={true}>Proceed</Button>;
  }
  return (
    <Wrapper inline={inline}>
      <div className="form__contents">
        <fieldset className="form__fields">
          <div className="form__text">
            Thanks for verifying your email {session.userId.name}.
            You can set a password for your account or just proceed to where
            you left off.
          </div>
        </fieldset>
      </div>
      <div className="form__footer-container">
        <footer className="form__footer">
          <Button path={`/users/${session.userId._id}/edit`} secondary={true}>
            Edit Account
          </Button>
          {homeControl}
        </footer>
      </div>
    </Wrapper>
  );
};

Verified.propTypes = {
  inline: PropTypes.bool.isRequired,
  returnPath: PropTypes.string,
  session: PropTypes.shape({
    name: PropTypes.string,
    userId: PropTypes.string,
  }).isRequired,
};

Verified.defaultProps = {
  returnPath: '/',
};

const Pending = (props) => {
  const { email, inline } = props;
  let homeControl;
  if (!inline) {
    homeControl = <Button path="/" secondary={true}>Home</Button>;
  }
  return (
    <Wrapper inline={inline}>
      <div className="form__contents">
        <fieldset className="form__fields">
          <div className="form__text">
            {"We've"} sent an email to {email}. Check your email for a message
            with the subject {"'Verify Email'"} and click the link in it to
            sign in.
          </div>
        </fieldset>
      </div>
      <div className="form__footer-container">
        <footer className="form__footer">
          {homeControl}
        </footer>
      </div>
    </Wrapper>
  );
};

Pending.propTypes = {
  email: PropTypes.string.isRequired,
  inline: PropTypes.bool.isRequired,
};

class VerifyEmail extends Component {

  constructor(props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSendLink = this._onSendLink.bind(this);
    this.state = {
      email: '',
      errors: {},
      state: 'prompt',
    };
  }

  componentDidMount() {
    const { inline, location } = this.props;
    if (!inline) {
      document.title = TITLE;
      const query = searchToObject(location.search);
      const { token, returnPath } = query;
      if (token) {
        postSessionViaToken({ token })
        .then(() => this.setState({ state: 'done', returnPath }))
        .catch((error) => {
          console.error('!!! Reset catch', error);
          this.setState({ state: 'prompt', errorMessage: error });
        });
      } else {
        this._emailRef.focus();
      }
    }
  }

  _onCancel() {
    const { returnPath } = this.props;
    const { router } = this.context;
    router.history.push(returnPath);
  }

  _onSendLink(event) {
    const { returnPath } = this.props;
    const { email } = this.state;
    event.preventDefault();
    if (!email) {
      this.setState({ errors: { email: 'required' } });
    } else if (!EMAIL_REGEXP.test(email)) {
      this.setState({ errors: { email: 'not an email address' } });
    } else {
      postVerifyEmail(email, returnPath)
      .then(() => this.setState({ state: 'pending' }))
      .catch((error) => {
        console.error('!!! VerifyEmail error', error);
        this.setState({ state: 'prompt', errorMessage: error.error });
      });
    }
  }

  _renderForm() {
    const { inline, onCancel, onSignIn, onSignUp } = this.props;
    const { email, errorMessage, errors } = this.state;
    const classNames = ['form__container'];
    if (inline) {
      classNames.push('form__container--inline');
    }

    let header;
    let footerCancelControl;
    let signInControl;
    let signUpControl;
    if (inline) {
      header = <div className="form__text"><h2>{TITLE}</h2></div>;
      footerCancelControl = (
        <Button secondary={true} label="Cancel" onClick={onCancel} />
      );
      signInControl = <a onClick={onSignIn}>Sign in</a>;
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
      signInControl = <Link to="/sign-in">Sign in</Link>;
      signUpControl = <Link to="/sign-up">Sign up</Link>;
    }

    return (
      <div className={classNames.join(' ')}>
        <form className="form" action="/api/users/sign-up">
          {header}
          <FormError message={errorMessage} />
          <div className="form__contents">
            <fieldset className="form__fields">
              <div className="form__text">
                <p>{"We'll"} send a link to your email
                address that you can use to sign in.</p>
              </div>
              <FormField name="email" label="Email" error={errors.email}>
                <input ref={(ref) => { this._emailRef = ref; }}
                  name="email" value={email}
                  onChange={event => this.setState({
                    email: event.target.value, errors: {} })} />
              </FormField>
            </fieldset>
          </div>
          <div className="form__footer-container">
            <footer className="form__footer">
              <button type="submit" className="button"
                onClick={this._onSendLink}>
                Send Email
              </button>
              {footerCancelControl}
            </footer>
            <footer className="form__footer">
              {signInControl}
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

  render() {
    const { inline, session } = this.props;
    const { email, returnPath, state } = this.state;

    let contents;
    switch (state) {
      case 'prompt':
      default:
        contents = this._renderForm();
        break;
      case 'pending':
        contents = <Pending inline={inline} email={email} session={session} />;
        break;
      case 'done':
        contents = (
          <Verified inline={inline} session={session} returnPath={returnPath} />
        );
        break;
    }
    return contents;
  }
}

VerifyEmail.propTypes = {
  inline: PropTypes.bool,
  location: PropTypes.object.isRequired,
  onCancel: PropTypes.func,
  onSignIn: PropTypes.func,
  onSignUp: PropTypes.func,
  returnPath: PropTypes.string,
  session: PropTypes.object,
};

VerifyEmail.defaultProps = {
  inline: false,
  location: undefined,
  onCancel: undefined,
  onSignIn: undefined,
  onSignUp: undefined,
  returnPath: '/',
  session: undefined,
};

VerifyEmail.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  session: state.session,
});

export default Stored(VerifyEmail, select);
