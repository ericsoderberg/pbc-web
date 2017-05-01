import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory, postSubscribe } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import Loading from '../../components/Loading';

class EmailListSubscribe extends Component {

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

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCategory('email-lists'));
  }

  _loadEmailList() {
    const { dispatch, name } = this.props;
    dispatch(loadCategory('email-lists', { filter: { name } }));
  }

  _onSubscribe(event) {
    event.preventDefault();
    const { emailList, history } = this.props;
    const { addresses } = this.state;
    postSubscribe(emailList, addresses.split('\n'))
    .then(() => history.goBack())
    .catch(error => this.setState({ error }));
  }

  _onCancel() {
    const { history } = this.props;
    history.goBack();
  }

  render() {
    const { emailList } = this.props;
    const { addresses } = this.state;

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
            <div className="form__contents">
              <fieldset className="form__fields">
                <FormField label="Addresses" help="one per line">
                  <textarea name="addresses" rows="6" value={addresses}
                    onChange={e =>
                      this.setState({ addresses: e.target.value })} />
                </FormField>
              </fieldset>
            </div>
            <div className="form__footer-container">
              <footer className="form__footer">
                <button type="submit" className="button"
                  onClick={this._onSubscribe}>
                  Subscribe
                </button>
              </footer>
            </div>
          </form>
        </div>
      );
    }

    return result;
  }
}

EmailListSubscribe.propTypes = {
  dispatch: PropTypes.func.isRequired,
  emailList: PropTypes.object,
  history: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
};

EmailListSubscribe.defaultProps = {
  emailList: undefined,
};

const select = (state, props) => {
  const name = props.match.params.name;
  const emailList = ((state['email-lists'] || {}).items || [])[0];
  return {
    name,
    emailList,
  };
};

export default connect(select)(EmailListSubscribe);
