
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SignIn from './SignIn';
import SignUp from '../user/SignUp';
import VerifyEmail from './VerifyEmail';

const SIGN_IN = 'signIn';
const VERIFY_EMAIL = 'verifyEmail';
const SIGN_UP = 'signUp';

export default class SessionSection extends Component {

  constructor(props) {
    super(props);
    this.state = { state: SIGN_IN };
  }

  _nextState(state) {
    return () => this.setState({ state });
  }

  render() {
    const { className, email, onCancel, returnPath } = this.props;
    const { state } = this.state;

    const classes = ['session-section__container'];
    if (className) {
      classes.push(className);
    }

    let contents;
    switch (state) {
      default:
      case SIGN_IN: {
        contents = (
          <SignIn inline={true}
            email={email}
            onCancel={onCancel}
            onVerifyEmail={this._nextState(VERIFY_EMAIL)}
            onSignUp={email ? undefined : this._nextState(SIGN_UP)} />
        );
        break;
      }
      case SIGN_UP: {
        contents = (
          <SignUp inline={true}
            onCancel={onCancel}
            onSignIn={this._nextState(SIGN_IN)}
            onVerifyEmail={this._nextState(VERIFY_EMAIL)} />
        );
        break;
      }
      case VERIFY_EMAIL: {
        contents = (
          <VerifyEmail inline={true}
            email={email}
            onCancel={onCancel}
            onSignIn={this._nextState(SIGN_IN)}
            onSignUp={email ? undefined : this._nextState(SIGN_UP)}
            returnPath={returnPath} />
        );
        break;
      }
    }

    return (
      <div className={classes.join(' ')}>
        {contents}
      </div>
    );
  }
}

SessionSection.propTypes = {
  className: PropTypes.string,
  email: PropTypes.string,
  onCancel: PropTypes.func,
  returnPath: PropTypes.string.isRequired,
};

SessionSection.defaultProps = {
  className: undefined,
  email: '',
  onCancel: undefined,
};
