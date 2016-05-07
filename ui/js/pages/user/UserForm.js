"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import FormEvents from '../../utils/FormEvents';
import ConfirmRemove from '../../components/ConfirmRemove';

export default class UserForm extends Component {

  constructor (props) {
    super(props);
    this._onCancel = this._onCancel.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this.state = { user: props.item };
  }

  componentDidMount () {
    this.refs.name.focus();
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ user: nextProps.item });
  }

  _onCancel () {
    this.context.router.goBack();
  }

  _onSubmit (event) {
    event.preventDefault();
    this.props.onSubmit(this.state.user);
  }

  _onRemove (event) {
    event.preventDefault();
    this.props.onRemove();
  }

  render () {
    const { title, action, submitLabel, onRemove, error } = this.props;
    const { user } = this.state;
    const formEvents = new FormEvents(user, (user) => this.setState({ user: user}));

    const cancelControl = (
      <button className="button--header" type="button" onClick={this._onCancel}>
        Cancel
      </button>
    );
    let removeControl;
    if (onRemove) {
      removeControl = <ConfirmRemove onConfirm={this._onRemove} />;
    }
    return (
      <form className="form" action={action} onSubmit={this._onSubmit}>
        <PageHeader title={title} actions={cancelControl} />
        <FormError message={error} />
        <fieldset className="form__fields">
          <FormField name="name" label="Name">
            <input ref="name" name="name" value={user.name || ''}
              onChange={formEvents.change('name')}/>
          </FormField>
          <FormField name="email" label="Email">
            <input name="email" value={user.email || ''}
              onChange={formEvents.change('email')}/>
          </FormField>
          <FormField name="password" label="Password">
            <input name="password" type="password" value={user.password || ''}
              onChange={formEvents.change('password')}/>
          </FormField>
          <FormField name="avatar" label="Avatar">
            <div>
              <img className="avatar"
                src={user.avatar ? user.avatar.data : ''} alt="avatar" />
            </div>
            <input name="avatar" type="file"
              onChange={formEvents.changeFile('avatar')}/>
          </FormField>
          <FormField>
            <input name="administrator" type="checkbox"
              checked={user.administrator || false}
              onChange={formEvents.toggle('administrator')}/>
            <label htmlFor="administrator">Administrator</label>
          </FormField>
        </fieldset>
        <footer className="form__footer">
          <button type="submit" onClick={this._onSubmit}>{submitLabel}</button>
          {removeControl}
        </footer>
      </form>
    );
  }
};

UserForm.propTypes = {
  action: PropTypes.string,
  error: PropTypes.object,
  item: PropTypes.object.isRequired,
  onRemove: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

UserForm.contextTypes = {
  router: PropTypes.any
};
