import React, { Component, PropTypes } from 'react';
import PageHeader from './PageHeader';
import FormError from './FormError';
import FormState from '../utils/FormState';
import Button from './Button';
import ConfirmRemove from './ConfirmRemove';
import Stored from './Stored';
import Loading from './Loading';

class Form extends Component {

  constructor(props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this._setItem = this._setItem.bind(this);
    this.state = {
      formState: new FormState(props.item || {}, this._setItem),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.item && nextProps.item._id !== this.props.item._id) {
      this.setState({
        formState: new FormState(nextProps.item, this._setItem),
      });
    }
  }

  _onSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state.formState.object);
  }

  _onRemove(event) {
    event.preventDefault();
    this.props.onRemove();
  }

  _setItem(item) {
    const { onChange } = this.props;
    this.setState({ formState: new FormState(item, this._setItem) });
    if (onChange) {
      onChange(item);
    }
  }

  render() {
    const {
      action, contentsProps, error, footerActions, FormContents,
      inline, loading, onCancel, onRemove, Preview, session, submitLabel, title,
    } = this.props;
    let { actions } = this.props;
    const { formState } = this.state;
    const classes = ['form__container'];
    if (inline) {
      classes.push('form__container--inline');
    }

    // convert duplicate key message to something more graceful
    if (error && error.code === 11000) {
      error.message = 'Already exists';
    }

    let header;
    let footerCancelControl;
    if (inline) {
      header = <div className="form__text"><h2>{title}</h2></div>;
      footerCancelControl = (
        <Button secondary={true} label="Cancel" onClick={onCancel} />
      );
    } else {
      actions = [...actions,
        <button key="cancel" type="button" className="button"
          onClick={onCancel}>
          Cancel
        </button>,
      ];
      header = <PageHeader title={title} actions={actions} />;
    }

    let removeControl;
    if (onRemove) {
      removeControl = <ConfirmRemove onConfirm={this._onRemove} />;
    }

    let preview;
    if (Preview) {
      preview = (
        <div className="form__preview">
          <Preview item={formState.object} />
        </div>
      );
      classes.push('form__container--preview');
    }

    let contents;
    if (loading) {
      contents = <Loading />;
    } else {
      const errors = {};
      Object.keys(error.errors || {}).forEach((key) => {
        const err = error.errors[key];
        errors[key] = err.kind === 'required' ? 'required' : err.message;
      });
      contents = (
        <FormContents className="form__contents" {...contentsProps}
          formState={formState} session={session} errors={errors} />
      );
    }

    return (
      <div className={classes.join(' ')}>
        <form className="form" action={action}
          onSubmit={this._onSubmit}>
          {header}
          <FormError error={error} />
          {contents}
          <div className="form__footer-container">
            <footer className="form__footer">
              <button type="submit" className="button" onClick={this._onSubmit}>
                {submitLabel}
              </button>
              {footerActions}
              {removeControl}
              {footerCancelControl}
            </footer>
          </div>
        </form>
        {preview}
      </div>
    );
  }
}

Form.propTypes = {
  action: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.element),
  contentsProps: PropTypes.object,
  error: PropTypes.shape({
    errors: PropTypes.object,
  }),
  footerActions: PropTypes.node,
  FormContents: PropTypes.func.isRequired,
  item: PropTypes.object,
  inline: PropTypes.bool,
  loading: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  Preview: PropTypes.func,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
  submitLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

Form.defaultProps = {
  action: undefined,
  actions: [],
  contentsProps: undefined,
  error: {},
  footerActions: undefined,
  item: undefined,
  inline: false,
  loading: false,
  onChange: undefined,
  onRemove: undefined,
  Preview: undefined,
};

Form.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  session: state.session,
});

export default Stored(Form, select);
