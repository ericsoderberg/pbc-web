import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import { loadItem, unloadItem, postNewsletterSend } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import NewsletterContents from './NewsletterContents';

const READY = 'ready';
const SENT = 'sent';
const ERROR = 'error';

class Newsletter extends Component {

  constructor() {
    super();
    this._onSend = this._onSend.bind(this);
    this.state = { sendState: 'ready' };
  }

  componentDidMount() {
    const { dispatch, id } = this.props;
    dispatch(loadItem('newsletters', id, { populate: true }));
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, id, newsletter } = nextProps;
    if (id !== this.props.id) {
      dispatch(loadItem('newsletters', id, { populate: true }));
    } else if (newsletter) {
      document.title = newsletter.name;
    }
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('newsletters', id));
  }

  _onSend(event) {
    const { id } = this.props;
    const { address } = this.state;
    event.preventDefault();
    postNewsletterSend(id, address)
    .then(() => this.setState({ sendState: SENT }))
    .catch(() => this.setState({ sendState: ERROR }));
  }

  render() {
    const { newsletter } = this.props;
    const { sendState } = this.state;
    let title;
    let sendControl;
    let contents;
    if (newsletter) {
      title = `${newsletter.name} - ${moment(newsletter.date).format('MMMM Do YYYY')}`;
      let button;
      if (sendState === READY) {
        button = <Button label="Send" secondary={true} type="submit" />;
      } else if (sendState === SENT) {
        button = <span className="newsletter-send__state secondary">sent</span>;
      } else if (sendState === ERROR) {
        button = <span className="newsletter-send__state error">uh-oh</span>;
      }
      sendControl = (
        <div className="newsletter-header">
          <form className="newsletter-send"
            action={`/newsletters/${newsletter._id}/send`}
            onSubmit={this._onSend}>
            <input placeholder="email address" name="address" type="text"
              onChange={event =>
                this.setState({ address: event.target.value, sendState: READY })} />
            {button}
          </form>
        </div>
      );
      contents = <NewsletterContents item={newsletter} reload={false} />;
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <ItemHeader category="newsletters" title={title} item={newsletter} />
        {sendControl}
        {contents}
      </main>
    );
  }
}

Newsletter.propTypes = {
  dispatch: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  newsletter: PropTypes.object,
};

Newsletter.defaultProps = {
  newsletter: undefined,
};

const select = (state, props) => {
  const id = props.match.params.id;
  return {
    id,
    notFound: state.notFound[id],
    newsletter: state[id],
    session: state.session,
  };
};

export default connect(select)(Newsletter);
