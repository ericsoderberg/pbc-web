
import React, { Component, PropTypes } from 'react';
import { postItem, haveSession, setSession } from '../actions';
import Form from './Form';

export default class Add extends Component {

  constructor(props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this.state = { item: props.default };
  }

  componentDidMount() {
    document.title = this.props.title;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.default && !this.props.default) {
      this.setState({ item: nextProps.default });
    }
  }

  _onAdd(item) {
    const { category, createSession, showable } = this.props;
    const { router } = this.context;
    postItem(category, item)
    .then((response) => {
      if (createSession) {
        // if we didn't have a session and we created one as part of adding,
        // remember it.
        if (!haveSession() && response.token) {
          // console.log('!!! Add set session', response);
          setSession(response);
        }
      }
      if (showable) {
        router.history.push(`/${category}/${response._id}`);
      } else {
        router.history.goBack();
      }
    })
    .catch(error => this.setState({ error, item }));
  }

  _onCancel() {
    const { router } = this.context;
    router.history.goBack();
  }

  render() {
    const { category, FormContents, onChange, Preview, title } = this.props;
    const { item, error } = this.state;
    return (
      <Form title={title} submitLabel="Add"
        action={`/api/${category}`}
        FormContents={FormContents} Preview={Preview} item={item}
        onChange={onChange}
        onSubmit={this._onAdd} error={error}
        onCancel={this._onCancel} />
    );
  }
}

Add.propTypes = {
  category: PropTypes.string.isRequired,
  createSession: PropTypes.bool,
  default: PropTypes.object,
  FormContents: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  Preview: PropTypes.func,
  showable: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

Add.defaultProps = {
  createSession: false,
  default: {},
  onChange: undefined,
  Preview: undefined,
  showable: false,
};

Add.contextTypes = {
  router: PropTypes.any,
};
