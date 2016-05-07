"use strict";
import React, { Component, PropTypes } from 'react';
import Form from '../../components/Form';
import FormField from '../../components/FormField';
import FormEvents from '../../utils/FormEvents';

export default class UserForm extends Component {

  constructor (props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._setUser = this._setUser.bind(this);
    this.state = {
      formEvents: new FormEvents(props.item, this._setUser),
      user: props.item
    };
  }

  componentDidMount () {
    this.refs.name.focus();
  }

  componentWillReceiveProps (nextProps) {
    this._setUser(nextProps.item);
  }

  _setUser (user) {
    this.state.formEvents.set(user);
    this.setState({ user: user});
  }

  _onSubmit () {
    this.props.onSubmit(this.state.user);
  }

  render () {
    const { title, action, submitLabel, onRemove, error } = this.props;
    const { user, formEvents } = this.state;

    return (
      <Form title={title} submitLabel={submitLabel} action={action}
        onSubmit={this._onSubmit} onRemove={onRemove} error={error}>
        <fieldset className="form__fields">
          <FormField label="Name">
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
          <FormField name="avatar" label="Avatar"
            onDrop={this.state.formEvents.dropFile('avatar')}>
            <div>
              <img className="avatar"
                src={user.avatar ? user.avatar.data : ''} />
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
      </Form>
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
