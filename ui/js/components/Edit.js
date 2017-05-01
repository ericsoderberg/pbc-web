import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadItem, putItem, deleteItem, unloadItem } from '../actions';
import Form from './Form';

class Edit extends Component {

  constructor(props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this.state = {}; // for error
  }

  componentDidMount() {
    const { item, title } = this.props;
    document.title = title;
    if (!item) {
      this._load(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { onChange } = nextProps;
    if (nextProps.id !== this.props.id) {
      this._load(nextProps);
    } else if (nextProps.item && onChange) {
      onChange(nextProps.item);
    }
  }

  componentWillUnmount() {
    const { category, dispatch, id } = this.props;
    dispatch(unloadItem(category, id));
  }

  _load(props) {
    const { category, dispatch, id, title } = props;
    document.title = title;
    dispatch(loadItem(category, id));
  }

  _onUpdate(item) {
    const { category, onUpdate } = this.props;
    const { router } = this.context;
    putItem(category, item)
    .then((response) => {
      if (onUpdate) {
        return onUpdate(item);
      }
      return response;
    })
    .then(() => router.history.goBack())
    .catch(error => this.setState({ error }));
  }

  _onRemove() {
    const { category, id, postRemovePath } = this.props;
    const { router } = this.context;
    deleteItem(category, id)
    .then(() => {
      if (postRemovePath) {
        router.history.push(postRemovePath);
      } else {
        router.history.go(-1);
      }
    })
    .catch(error => this.setState({ error }));
  }

  _onCancel() {
    const { router } = this.context;
    router.history.goBack();
  }

  render() {
    const {
      actions, category, footerActions, FormContents, id, item,
      onChange, Preview, session, submitLabel, title,
    } = this.props;
    const { error } = this.state;
    return (
      <Form title={title} actions={actions} footerActions={footerActions}
        submitLabel={submitLabel} session={session} loading={!item}
        action={`/api/${category}/${id}`}
        FormContents={FormContents} Preview={Preview} item={item}
        onChange={onChange}
        onSubmit={this._onUpdate} onRemove={this._onRemove}
        error={error} onCancel={this._onCancel} />
    );
  }
}

Edit.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.element),
  category: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  FormContents: PropTypes.func.isRequired,
  footerActions: PropTypes.node,
  id: PropTypes.string.isRequired,
  item: PropTypes.object,
  onChange: PropTypes.func,
  onUpdate: PropTypes.func,
  Preview: PropTypes.func,
  postRemovePath: PropTypes.string,
  session: PropTypes.object,
  submitLabel: PropTypes.string,
  title: PropTypes.string.isRequired,
};

Edit.defaultProps = {
  actions: undefined,
  footerActions: undefined,
  item: undefined,
  onChange: undefined,
  onUpdate: undefined,
  Preview: undefined,
  postRemovePath: undefined,
  session: undefined,
  submitLabel: 'Update',
};

Edit.contextTypes = {
  router: PropTypes.any,
};

const select = (state, props) => {
  const id = props.id || props.match.params.id;
  return {
    id,
    item: state[id],
    session: state.session,
  };
};

export default connect(select)(Edit);
