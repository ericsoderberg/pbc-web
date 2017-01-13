"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from './PageHeader';
import FormError from './FormError';
import FormState from '../utils/FormState';
import Button from './Button';
import ConfirmRemove from './ConfirmRemove';
import Stored from './Stored';

class Form extends Component {

  constructor (props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this._setItem = this._setItem.bind(this);
    this.state = {
      formState: new FormState(props.item || {}, this._setItem)
    };
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.item && nextProps.item._id !== this.props.item._id) {
      this.setState({
        formState: new FormState(nextProps.item, this._setItem)
      });
    }
  }

  _onSubmit (event) {
    event.preventDefault();
    this.props.onSubmit(this.state.formState.object);
  }

  _onRemove (event) {
    event.preventDefault();
    this.props.onRemove();
  }

  _setItem (item) {
    const { onChange } = this.props;
    this.setState({ formState: new FormState(item, this._setItem) });
    if (onChange) {
      onChange(item);
    }
  }

  render () {
    const {
      action, actions, contentsProps, error, footerActions, FormContents,
      inline, onCancel, onRemove, Preview, session, submitLabel, title
     } = this.props;
    const { formState } = this.state;
    let classes = ['form__container'];
    if (inline) {
      classes.push('form__container--inline');
    }

    let header, footerCancelControl;
    if (inline) {
      header = <div className='form__text'><h2>{title}</h2></div>;
      footerCancelControl = (
        <Button secondary={true} label="Cancel" onClick={onCancel} />
      );
    } else {
      const headerActions = (
        <nav className="page-header__actions">
          {actions}
          <button className="button-header" type="button" onClick={onCancel}>
            Cancel
          </button>
        </nav>
      );
      header = <PageHeader title={title} actions={headerActions} />;
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

    return (
      <div className={classes.join(' ')}>
        <form className="form" action={action}
          onSubmit={this._onSubmit}>
          {header}
          <div className="form__contents">
            <FormError message={error} />
            <FormContents {...contentsProps}
              formState={formState} session={session} />
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
};

Form.propTypes = {
  action: PropTypes.string,
  actions: PropTypes.node,
  contentsProps: PropTypes.object,
  error: PropTypes.object,
  footerActions: PropTypes.node,
  FormContents: PropTypes.func.isRequired,
  item: PropTypes.object,
  inline: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  Preview: PropTypes.func,
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string,
    name: PropTypes.string
  }),
  submitLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

Form.contextTypes = {
  router: PropTypes.any
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(Form, select);
