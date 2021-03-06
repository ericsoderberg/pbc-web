
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loadItem, postUnsubscribe, unloadItem, getEmailListDownload } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import TrashIcon from '../../icons/Trash';
import { searchToObject } from '../../utils/Params';

class EmailList extends Component {

  constructor() {
    super();
    this._onSearch = this._onSearch.bind(this);
    this._onDownload = this._onDownload.bind(this);
    this.state = { addresses: [], searchText: '' };
  }

  componentDidMount() {
    this._load();
  }

  componentWillReceiveProps(nextProps) {
    this._setStateFromLocation(nextProps);
    if (nextProps.emailList) {
      document.title = nextProps.emailList.name;
      this._setStateFromLocation(nextProps);
    }
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('email-lists', id));
  }

  _load() {
    const { dispatch, id } = this.props;
    dispatch(loadItem('email-lists', id));
  }

  _setStateFromLocation(props) {
    const query = searchToObject(props.location.search);
    const searchText = query.q || '';
    const addresses = this._pruneAddresses(props, searchText);
    this.setState({ addresses, searchText });
  }

  _pruneAddresses(props, searchText) {
    const { emailList } = props;
    let addresses = (emailList || {}).addresses || [];
    if (searchText) {
      const exp = new RegExp(searchText, 'i');
      addresses = addresses.filter(a => (
        exp.test(a.address) || (a.userId && exp.test(a.userId.name))
      ));
    }
    return addresses;
  }

  _onSearch(event) {
    const { history } = this.props;
    const searchText = event.target.value;
    const addresses = this._pruneAddresses(this.props, searchText);
    this.setState({ addresses, searchText });
    // Put the search term in the browser location
    history.replace({
      pathname: window.location.pathname,
      search: `?q=${encodeURIComponent(searchText)}`,
    });
  }

  _unsubscribe(address) {
    return () => {
      const { emailList } = this.props;
      postUnsubscribe(emailList, [address])
        .then(() => this._load())
        .catch(error => this.setState({ error }));
    };
  }

  _onDownload(event) {
    const { emailList } = this.props;
    event.preventDefault();
    getEmailListDownload(emailList);
  }

  render() {
    const { emailList, notFound, session } = this.props;
    const { addresses, loading, searchText } = this.state;

    let result;
    if (emailList) {
      const actions = [];
      if (session && (session.userId.administrator ||
        session.userId.domainIds.some(id => id === emailList.domainId))) {
        if (emailList.heldMessages.length > 0) {
          actions.push((
            <Link key="moderate" to={`/email-lists/${emailList._id}/moderate`}>
              Moderate
            </Link>
          ));
        }
        actions.push(
          <Link key="add" to={`/email-lists/${emailList.name}/subscribe`}>
            Subscribe
          </Link>,
          <a key="download"
            href={`/api/email-lists/${emailList._id}.txt`}
            onClick={this._onDownload}>
            Download
          </a>,
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
              <div className="box--row box--static box--between">
                {user}
                {state}
                <button type="button"
                  className="button-icon"
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
          <PageHeader title={emailList.name}
            homer={true}
            focusOnSearch={false}
            searchText={searchText}
            onSearch={this._onSearch}
            actions={actions} />
          <ul className="list email-list__addresses">
            {items}
          </ul>
          {message}
        </main>
      );
    } else if (notFound) {
      result = <NotFound />;
    } else {
      result = <Loading />;
    }

    return result;
  }
}

EmailList.propTypes = {
  dispatch: PropTypes.func.isRequired,
  emailList: PropTypes.object,
  history: PropTypes.any.isRequired,
  id: PropTypes.string.isRequired,
  notFound: PropTypes.bool,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      domainIds: PropTypes.arrayOf(PropTypes.string),
    }),
  }).isRequired,
};

EmailList.defaultProps = {
  emailList: undefined,
  notFound: false,
};

const select = (state, props) => {
  const id = props.match.params.id;
  return {
    id,
    notFound: state.notFound[id],
    emailList: state[id],
    session: state.session,
  };
};

export default connect(select)(EmailList);
