import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { getItem, postNewsletterSend } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import NewsletterContents from './NewsletterContents';

const READY = 'ready';
const SENT = 'sent';
const ERROR = 'error';

export default class Newsletter extends Component {

  constructor() {
    super();
    this._onSend = this._onSend.bind(this);
    this.state = { sendState: 'ready' };
  }

  componentDidMount() {
    this._load(this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this._load(nextProps.match.params.id);
    }
  }

  _load(id) {
    getItem('newsletters', id, { populate: true })
    .then((newsletter) => {
      document.title = `${newsletter.name} - ${moment(newsletter.date).format('MMMM Do YYYY')}`;
      this.setState({ newsletter });
    })
    .catch(error => console.error('!!! Newsletter catch', error));
  }

  _onSend(event) {
    const { address } = this.state;
    event.preventDefault();
    postNewsletterSend(this.props.match.params.id, address)
    .then(() => this.setState({ sendState: SENT }))
    .catch(() => this.setState({ sendState: ERROR }));
  }

  render() {
    const { newsletter, sendState } = this.state;
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
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
