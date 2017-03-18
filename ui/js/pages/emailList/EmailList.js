
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem, postUnsubscribe } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import TrashIcon from '../../icons/Trash';

class EmailList extends Component {

  constructor() {
    super();
    this._onSearch = this._onSearch.bind(this);
    this.state = { addresses: [] };
  }

  componentDidMount() {
    this._setStateFromLocation(this.props);
    this._loadEmailList();
  }

  componentWillReceiveProps(nextProps) {
    this._setStateFromLocation(nextProps);
  }

  _setStateFromLocation(props) {
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

  _loadEmailList() {
    const { params: { id } } = this.props;
    const { searchText } = this.state;
    getItem('email-lists', id)
    .then((emailList) => {
      let addresses = emailList.addresses;
      if (searchText) {
        const exp = new RegExp(searchText, 'i');
        addresses = addresses.filter(a => exp.test(a));
      }
      this.setState({ addresses, emailList });
      document.title = emailList.name;
    })
    .catch(error => console.error('!!! EmailList catch', error));
  }

  _setLocation(options) {
    const { router } = this.context;
    const searchParams = [];

    const searchText = options.searchText !== undefined ? options.searchText :
      (this.state.searchText !== undefined ? this.state.searchText : undefined);
    if (searchText) {
      searchParams.push(`search=${encodeURIComponent(searchText)}`);
    }

    router.replace({
      pathname: window.location.pathname,
      search: `?${searchParams.join('&')}`,
    });
  }

  _onSearch(event) {
    const searchText = event.target.value;
    this._setLocation({ searchText, loading: true });
  }

  _unsubscribe(address) {
    return () => {
      const { emailList } = this.state;
      postUnsubscribe(emailList, [address])
      .then(() => this._loadEmailList())
      .catch(error => this.setState({ error }));
    };
  }

  render() {
    const { session } = this.props;
    const { addresses, emailList, loading, searchText } = this.state;

    let result;
    if (!emailList) {
      result = <Loading />;
    } else {
      const actions = [];
      if (session && (session.userId.administrator ||
        session.userId.administratorDomainId === emailList.domainId)) {
        actions.push(
          <Link key="add" to={`/email-lists/${emailList._id}/subscribe`}>
            Subscribe
          </Link>,
          <Link key="edit" to={`/email-lists/${emailList._id}/edit`}>
            Edit
          </Link>,
        );
      }

      const items = addresses.map((address) => {
        const classNames = ['item'];

        let user;
        if (address.userId) {
          user = (
            <Link to={`/users/${address.userId._id}`}>
              {address.userId.name}
            </Link>
          );
        }

        let state;
        if (address.state === 'disabled') {
          classNames.push('error');
          state = <span>{address.state}</span>;
        }

        return (
          <div key={address._id} className="item__container">
            <div className={classNames.join(' ')}>
              <span className="item__name">{address.address}</span>
              <span className="box__connector" />
              <div className="box--row">
                {user}
                {state}
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
      } else {
        message = <div className="list__count">{items.length}</div>;
      }

      result = (
        <main>
          <PageHeader title={emailList.name} homer={true} focusOnSearch={false}
            searchText={searchText} onSearch={this._onSearch}
            actions={actions} />
          <ul className="list email-list__addresses">
            {items}
          </ul>
          {message}
        </main>
      );
    }
    return result;
  }
}

EmailList.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
    }),
  }).isRequired,
};

EmailList.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  session: state.session,
});

export default Stored(EmailList, select);
