
import React, { Component, PropTypes } from 'react';
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
    const { className, onCancel, returnPath } = this.props;
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
          <SignIn inline={true} onCancel={onCancel}
            onVerifyEmail={this._nextState(VERIFY_EMAIL)}
            onSignUp={this._nextState(SIGN_UP)} />
        );
        break;
      }
      case SIGN_UP: {
        contents = (
          <SignUp inline={true} onCancel={onCancel}
            onSignIn={this._nextState(SIGN_IN)}
            onVerifyEmail={this._nextState(VERIFY_EMAIL)} />
        );
        break;
      }
      case VERIFY_EMAIL: {
        contents = (
          <VerifyEmail inline={true} onCancel={onCancel}
            onSignIn={this._nextState(SIGN_IN)}
            onSignUp={this._nextState(SIGN_UP)} returnPath={returnPath} />
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
  onCancel: PropTypes.func,
  returnPath: PropTypes.string.isRequired,
};

SessionSection.defaultProps = {
  className: undefined,
  onCancel: undefined,
};