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
    document.title = 'Verify Email';
    const temporaryToken = this.props.location.query.token;
    if (temporaryToken) {
      postSessionViaToken({ token: this.props.location.query.token })
      .then(() => this.setState({ state: 'done' }))
      .catch((error) => {
        console.error('!!! Reset catch', error);
        this.setState({ state: 'prompt', errorMessage: error });
      });
    } else {
      this._emailRef.focus();
    }
  }

  _onCancel() {
    this.context.router.push('/');
  }

  _onSendLink(event) {
    event.preventDefault();
    if (!this.state.email) {
      this.setState({ errors: { email: 'required' } });
    } else if (!EMAIL_REGEXP.test(this.state.email)) {
      this.setState({ errors: { email: 'not an email address' } });
    } else {
      postVerifyEmail(this.state.email)
      .then(() => this.setState({ state: 'pending' }))
      .catch((error) => {
        console.error('!!! VerifyEmail error', error);
        this.setState({ state: 'prompt', errorMessage: error.error });
      });
    }
  }

  _renderForm() {
    const { email, errorMessage, errors } = this.state;

    const cancelControl = [
      <button key="cancel" type="button" className="button"
        onClick={this._onCancel}>
        Cancel
      </button>,
    ];

    return (
      <div className="form__container">
        <form className="form" action="/api/users/sign-up">
          <PageHeader title="Verify Email" actions={cancelControl} />
          <FormError message={errorMessage} />
          <div className="form__contents">
            <fieldset className="form__fields">
              <div className="form__text">
                <p>You can sign in via a link {"we'll"} send to your email
                address.</p>
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
            </footer>
            <footer className="form__footer">
              <Link to="/sign-in">Sign in with a password</Link>
            </footer>
          </div>
        </form>
      </div>
    );
  }

  _renderPending() {
    const { email } = this.state;
    return (
      <div className="form__container">
        <div className="form">
          <PageHeader title="Verify Email" />
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
              <Link to="/">Home</Link>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  _renderCheck() {
    return (
      <div className="form__container">
        <div className="form">
          <PageHeader title="Verify Email" />
          <div className="form__contents">
            <fieldset className="form__fields">
              <div className="form__text">
                Verifying
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    );
  }

  _renderVerified() {
    const { session } = this.props;
    return (
      <div className="form__container">
        <div className="form">
          <PageHeader title="Verify Email" />
          <div className="form__contents">
            <fieldset className="form__fields">
              <div className="form__text">
                Thanks for verifying your email {session.name}.
                You can set a password for your account or just use the site.
              </div>
            </fieldset>
          </div>
          <div className="form__footer-container">
            <footer className="form__footer">
              <Button path={`/users/${session.userId}/edit`} secondary={true}>
                Edit Account
              </Button>
              <Button path="/" secondary={true}>Home</Button>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { state } = this.state;

    let result;
    switch (state) {
      case 'prompt':
      default:
        result = this._renderForm();
        break;
      case 'pending':
        result = this._renderPending();
        break;
      case 'check':
        result = this._renderCheck();
        break;
      case 'done':
        result = this._renderVerified();
        break;
    }
    return result;
  }
}

VerifyEmail.propTypes = {
  location: PropTypes.shape({
    query: PropTypes.shape({
      token: PropTypes.string,
    }),
  }).isRequired,
  session: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
};

VerifyEmail.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  session: state.session,
});

export default Stored(VerifyEmail, select);
