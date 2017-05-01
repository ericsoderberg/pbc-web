import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadCategory, postUnsubscribe, unloadCategory } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import SessionSection from '../session/SessionSection';
import Button from '../../components/Button';
import Loading from '../../components/Loading';

const LOADING = 'loading';
const AUTHENTICATION_NEEDED = 'authenticationNeeded';
const SESSION = 'session';
const READY = 'ready';
const DONE = 'done';

class EmailListUnsubscribe extends Component {

  constructor(props) {
    super(props);
    this._onUnsubscribe = this._onUnsubscribe.bind(this);
    this.state = { state: LOADING };
  }

  componentDidMount() {
    const { session } = this.props;
    document.title = 'Unsubscribe';
    if (!session) {
      this.setState({ state: AUTHENTICATION_NEEDED });
    } else {
      this._loadEmailList();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { emailList, name, session } = nextProps;
    if (name !== this.props.name) {
      this._loadEmailList();
    } else if (emailList) {
      this.setState({ state: session ? READY : AUTHENTICATION_NEEDED });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCategory('email-lists'));
  }

  _loadEmailList() {
    const { dispatch, name } = this.props;
    dispatch(loadCategory('email-lists', { filter: { name } }));
  }

  _onUnsubscribe(event) {
    const { emailList, session } = this.props;
    event.preventDefault();
    postUnsubscribe(emailList, [session.userId.email])
    .then(() => this.setState({ state: DONE }))
    .catch(error => this.setState({ error }));
  }

  _onCancel() {
    const { history } = this.props;
    history.replace('/');
  }

  render() {
    const { emailList, history, name, session } = this.props;
    const { state } = this.state;

    let contents;
    switch (state) {

      case LOADING: {
        contents = <Loading />;
        break;
      }

      case AUTHENTICATION_NEEDED: {
        contents = (
          <div className="form__container">
            <div className="form">
              <PageHeader homer={true} title={`Unsubscribe from ${name}`} />
              <fieldset className="form__fields">
                <p className="form__text">
                  You must sign in or verify your email to unsubscribe.
                </p>
              </fieldset>
              <footer className="form__footer">
                <Button label="Sign In"
                  onClick={() => this.setState({ state: SESSION })} />
              </footer>
            </div>
          </div>
        );
        break;
      }

      case SESSION: {
        contents = (
          <SessionSection onCancel={() =>
              this.setState({ state: AUTHENTICATION_NEEDED })}
            returnPath={window.location.pathname} />
        );
        break;
      }

      case READY: {
        contents = (
          <div className="form__container">
            <form className="form"
              action={`/api/email-lists/${emailList._id}/unsubscribe`}
              onSubmit={this._onUnsubscribe}>
              <PageHeader homer={true}
                title={`Unsubscribe from ${emailList.name}`} />
              <fieldset className="form__fields">
                <FormField label="Address">
                  <input type="text" value={session.userId.email}
                    disabled={true} />
                </FormField>
              </fieldset>
              <footer className="form__footer">
                <button type="submit" className="button"
                  onClick={this._onUnsubscribe}>
                  Unsubscribe
                </button>
              </footer>
            </form>
          </div>
        );
        break;
      }

      case DONE: {
        contents = (
          <div className="form__container">
            <div className="form">
              <PageHeader homer={true} title={`Unsubscribe from ${name}`} />
              <fieldset className="form__fields">
                <p className="form__text">
                  You have been successfully unsubscribed.
                </p>
              </fieldset>
              <footer className="form__footer">
                <Button label="Home"
                  onClick={() => history.replace('/')} />
              </footer>
            </div>
          </div>
        );
        break;
      }

      default:
        contents = <Loading />;
    }

    return contents;
  }
}

EmailListUnsubscribe.propTypes = {
  dispatch: PropTypes.func.isRequired,
  emailList: PropTypes.object,
  history: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  session: PropTypes.object,
};

EmailListUnsubscribe.defaultProps = {
  emailList: undefined,
  session: undefined,
};

const select = (state, props) => {
  const name = props.match.params.name;
  const emailList = ((state['email-lists'] || {}).items || [])[0];
  return {
    emailList,
    name,
    session: state.session,
  };
};

export default connect(select)(EmailListUnsubscribe);
