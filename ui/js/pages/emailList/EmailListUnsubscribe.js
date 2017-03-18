import React, { Component, PropTypes } from 'react';
import { getItems, postUnsubscribe } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import SessionSection from '../session/SessionSection';
import Button from '../../components/Button';
import Stored from '../../components/Stored';
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
    if (nextProps.params.name !== this.props.params.name) {
      this._loadEmailList();
    }
  }

  _loadEmailList() {
    const { params: { name } } = this.props;
    getItems('email-lists', { filter: { name } })
    .then(emailLists => this.setState({ emailList: emailLists[0], state: READY }))
    .catch(error => console.error('!!! EmailListUnsubscribe catch', error));
  }

  _onUnsubscribe(event) {
    const { session } = this.props;
    event.preventDefault();
    const { emailList } = this.state;
    postUnsubscribe(emailList, [session.userId.email])
    .then(() => this.setState({ state: DONE }))
    .catch(error => this.setState({ error }));
  }

  _onCancel() {
    this.context.router.replace('/');
  }

  render() {
    const { params: { name }, session } = this.props;
    const { emailList, state } = this.state;

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
          <SessionSection onCancel={() => this.setState({ state: AUTHENTICATION_NEEDED })}
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
              <PageHeader homer={true} title={`Unsubscribe from ${emailList.name}`} />
              <fieldset className="form__fields">
                <FormField label="Address">
                  <input type="text" value={session.userId.email} disabled={true} />
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
                  onClick={() => this.context.router.replace('/')} />
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
  params: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  session: PropTypes.object,
};

EmailListUnsubscribe.defaultProps = {
  session: undefined,
};

EmailListUnsubscribe.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  session: state.session,
});

export default Stored(EmailListUnsubscribe, select);
