
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { postItem, haveSession, setSession } from '../actions';
import Form from './Form';

class Add extends Component {

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
    const { category, createSession, dispatch, history, showable } = this.props;
    postItem(category, item)
    .then((response) => {
      if (createSession) {
        // if we didn't have a session and we created one as part of adding,
        // remember it.
        if (!haveSession() && response.token) {
          // console.log('!!! Add set session', response);
          dispatch(setSession(response));
        }
      }
      if (showable) {
        history.push(`/${category}/${response._id}`);
      } else {
        history.goBack();
      }
    })
    .catch(error => this.setState({ error, item }));
  }

  _onCancel() {
    const { history } = this.props;
    history.goBack();
  }

  render() {
    const {
      category, contentsProps, FormContents, onChange, Preview, session, title,
    } = this.props;
    const { item, error } = this.state;
    return (
      <Form title={title}
        submitLabel="Add"
        action={`/api/${category}`}
        session={session}
        contentsProps={contentsProps}
        FormContents={FormContents}
        Preview={Preview}
        item={item}
        onChange={onChange}
        onSubmit={this._onAdd}
        error={error}
        onCancel={this._onCancel} />
    );
  }
}

Add.propTypes = {
  category: PropTypes.string.isRequired,
  contentsProps: PropTypes.object,
  createSession: PropTypes.bool,
  default: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  FormContents: PropTypes.func.isRequired,
  history: PropTypes.any.isRequired,
  onChange: PropTypes.func,
  Preview: PropTypes.func,
  session: PropTypes.object,
  showable: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

Add.defaultProps = {
  contentsProps: undefined,
  createSession: false,
  default: undefined,
  onChange: undefined,
  Preview: undefined,
  session: undefined,
  showable: false,
};

const select = state => ({
  session: state.session,
});

export default connect(select)(Add);
