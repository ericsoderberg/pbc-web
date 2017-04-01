import React, { Component, PropTypes } from 'react';
import { getItems, postSubscribe } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import Loading from '../../components/Loading';

export default class EmailListSubscribe extends Component {

  constructor(props) {
    super(props);
    this._onSubscribe = this._onSubscribe.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this.state = { addresses: '' };
  }

  componentDidMount() {
    document.title = 'Subscribe';
    this._loadEmailList();
  }

  _loadEmailList() {
    const { match } = this.props;
    getItems('email-lists', { filter: { name: match.params.name } })
    .then(emailLists => this.setState({ emailList: emailLists[0] }))
    .catch(error => console.error('!!! EmailListSubscribe catch', error));
  }

  _onSubscribe(event) {
    event.preventDefault();
    const { addresses, emailList } = this.state;
    const { router } = this.context;
    postSubscribe(emailList, addresses.split('\n'))
    .then(() => router.history.goBack())
    .catch(error => this.setState({ error }));
  }

  _onCancel() {
    const { router } = this.context;
    router.history.goBack();
  }

  render() {
    const { addresses, emailList } = this.state;

    let result;
    if (!emailList) {
      result = <Loading />;
    } else {
      const cancel = (
        <button key="cancel" type="button" className="button"
          onClick={this._onCancel}>
          Cancel
        </button>
      );
      result = (
        <div className="form__container">
          <form className="form" action={`/api/email-lists/${emailList._id}`}
            onSubmit={this._onSubscribe}>
            <PageHeader title={`Subscribe to ${emailList.name}`}
              actions={[cancel]} />
            <fieldset className="form__fields">
              <FormField label="Addresses" help="one per line">
                <textarea name="addresses" rows="6" value={addresses}
                  onChange={e =>
                    this.setState({ addresses: e.target.value })} />
              </FormField>
            </fieldset>
            <footer className="form__footer">
              <button type="submit" className="button"
                onClick={this._onSubscribe}>
                Subscribe
              </button>
            </footer>
          </form>
        </div>
      );
    }

    return result;
  }
}

EmailListSubscribe.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

EmailListSubscribe.contextTypes = {
  router: PropTypes.any,
};
