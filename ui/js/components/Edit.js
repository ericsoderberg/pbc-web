import React, { Component, PropTypes } from 'react';
import { getItem, putItem, deleteItem } from '../actions';
import Form from './Form';

export default class Edit extends Component {

  constructor(props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this.state = { item: {} };
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this._load(nextProps);
    }
  }

  _load(props) {
    const { category, match, title } = props;
    document.title = title;
    this.setState({ loading: true });
    getItem(category, match.params.id)
    .then((item) => {
      const { onChange } = props;
      this.setState({ item, loading: false });
      if (onChange) {
        onChange(item);
      }
    })
    .catch(error => console.error('!!! Edit catch', error));
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
    const { category, match, removeBackLevel } = this.props;
    const { router } = this.context;
    deleteItem(category, match.params.id)
    .then(() => router.history.go(-(removeBackLevel)))
    .catch(error => this.setState({ error }));
  }

  _onCancel() {
    const { router } = this.context;
    router.history.goBack();
  }

  render() {
    const {
      actions, category, match, footerActions, FormContents,
      onChange, Preview, submitLabel, title,
    } = this.props;
    const { item, error, loading } = this.state;
    return (
      <Form title={title} actions={actions} footerActions={footerActions}
        submitLabel={submitLabel} loading={loading}
        action={`/api/${category}/${match.params.id}`}
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
  FormContents: PropTypes.func.isRequired,
  footerActions: PropTypes.node,
  onChange: PropTypes.func,
  onUpdate: PropTypes.func,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  Preview: PropTypes.func,
  removeBackLevel: PropTypes.number,
  submitLabel: PropTypes.string,
  title: PropTypes.string.isRequired,
};

Edit.defaultProps = {
  actions: undefined,
  footerActions: undefined,
  onChange: undefined,
  onUpdate: undefined,
  Preview: undefined,
  removeBackLevel: 2,
  submitLabel: 'Update',
};

Edit.contextTypes = {
  router: PropTypes.any,
};
