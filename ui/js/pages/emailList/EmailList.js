"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem, postUnsubscribe } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import TrashIcon from '../../icons/Trash';

class EmailList extends Component {

  constructor () {
    super();
    this._onSearch = this._onSearch.bind(this);
    this.state = { addresses: [] };
  }

  componentDidMount () {
    document.title = this.props.title;
    this._setStateFromLocation(this.props);
    this._loadEmailList();
  }

  componentWillReceiveProps (nextProps) {
    this._setStateFromLocation(nextProps);
  }

  _setStateFromLocation (props) {
    const { emailList } = this.state;
    const searchText = props.location.query.search || '';
    let addresses = (emailList || {}).addresses || [];
    if (searchText) {
      const exp = new RegExp(searchText, 'i');
      addresses = addresses.filter(a => (
        exp.test(a.address) || (a.userId && exp.test(a.userId.name))
      ));
    }
    this.setState({ addresses, searchText });
  }

  _loadEmailList () {
    const { params: { id } } = this.props;
    const { searchText } = this.state;
    getItem('email-lists', id)
    .then(emailList => {
      let addresses = emailList.addresses;
      if (searchText) {
        const exp = new RegExp(searchText, 'i');
        addresses = addresses.filter(a => exp.test(a));
      }
      this.setState({ addresses, emailList });
    })
    .catch(error => console.log('!!! EmailList catch', error));
  }

  _setLocation (options) {
    const { router } = this.context;
    let searchParams = [];

    const searchText = options.hasOwnProperty('searchText') ?
      options.searchText : this.state.searchText || undefined;
    if (searchText) {
      searchParams.push(`search=${encodeURIComponent(searchText)}`);
    }

    router.replace({
      pathname: window.location.pathname,
      search: `?${searchParams.join('&')}`
    });
  }

  _onSearch (event) {
    const searchText = event.target.value;
    this._setLocation({ searchText, loading: true });
  }

  _unsubscribe (address) {
    return (event) => {
      const { emailList } = this.state;
      postUnsubscribe(emailList, [address])
      .then(() => this._loadEmailList())
      .catch(error => this.setState({ error: error }));
    };
  }

  render () {
    const { session } = this.props;
    const { addresses, emailList, loading, searchText } = this.state;

    let result;
    if (! emailList) {
      result = <Loading />;
    } else {

      const actions = [];
      if (session && (session.administrator ||
        session.administratorDomainId === library.domainId)) {
        actions.push(
          <Link key='edit' to={`/email-lists/${emailList._id}/edit`}>
            Edit
          </Link>,
          <Link key='add' to={`/email-lists/${emailList._id}/subscribe`}>
            Subscribe
          </Link>
        );
      }

      const items = addresses.map((address, index) => {
        let user;
        if (address.userId) {
          user = (
            <Link to={`/users/${address.userId._id}`}>
              {address.userId.name}
            </Link>
          );
        }
        return (
          <div key={address._id} className="item__container">
            <div className="item">
              <span className="item__name">{address.address}</span>
              <div className="box--row">
                {user}
                <button type="button" className="button-icon"
                  onClick={this._unsubscribe(address.address)}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          </div>
        );
      });

      let message;
      if (items.length === 0) {
        if (loading) {
          message = <Loading />;
        } else {
          const text = searchText ? 'No matches' :
            'No addresses have been subscribed';
          message = <div className="list__message">{text}</div>;
        }
      }

      result = (
        <main>
          <PageHeader title={emailList.name} homer={true} focusOnSearch={false}
            searchText={searchText} onSearch={this._onSearch}
            actions={actions} />
          <ul className="list">
            {items}
          </ul>
          {message}
        </main>
      );
    }
    return result;
  }
};

EmailList.propTypes = {
  location: PropTypes.object,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }),
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string
  })
};

EmailList.contextTypes = {
  router: PropTypes.any
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(EmailList, select);
