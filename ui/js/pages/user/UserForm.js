"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';

export default class UserForm extends Component {

  constructor () {
    super();
    this._onCancel = this._onCancel.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onToggle = this._onToggle.bind(this);
    this.state = { user: {} };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ user: nextProps.user });
  }

  _onCancel () {
    this.context.router.goBack();
  }

  _onSubmit (event) {
    event.preventDefault();
    this.props.onSubmit(this.state.user);
  }

  _onChange (propertyName) {
    return (event => {
      let user = { ...this.state.user };
      user[propertyName] = event.target.value;
      this.setState({ user: user });
    });
  }

  _onToggle (propertyName) {
    return (event => {
      let user = { ...this.state.user };
      user[propertyName] = ! user[propertyName];
      this.setState({ user: user });
    });
  }

  _onFile (propertyName) {
    return (event => {
      console.log('!!! _onFile');
      const files = event.target.files;
      let fileData;
      if (files && files[0]) {
        console.log('!!! _onFile A');
        const file = files[0];
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          console.log('!!! _onFile B');
          fileData = {
            data: reader.result,
            name: file.name,
            size: file.size,
            type: file.type
          };
          console.log('!!! fileData', fileData);
          let user = { ...this.state.user };
          user[propertyName] = fileData;
          this.setState({ user: user });
        });
        reader.readAsDataURL(file);
      }
    });
  }

  render () {
    const { title, action, submitLabel, onRemove, errors } = this.props;
    const { user } = this.state;
    console.log('!!! render', user);

    const cancelControl = (
      <button className="button--header" type="button" onClick={this._onCancel}>
        Cancel
      </button>
    );
    let removeControl;
    if (onRemove) {
      removeControl = <button onClick={this._onRemove}>Remove</button>;
    }
    return (
      <form className="form" action={action} onSubmit={this._onSubmit}>
        <PageHeader title={title} actions={cancelControl} />
        {errors}
        <fieldset className="form__fields">
          <FormField name="name" label="Name">
            <input name="name" value={user.name || ''}
              onChange={this._onChange('name')}/>
          </FormField>
          <FormField name="email" label="Email">
            <input name="email" value={user.email || ''}
              onChange={this._onChange('email')}/>
          </FormField>
          <FormField name="avatar" label="Avatar">
            <div>
              <img className="avatar"
                src={user.avatar ? user.avatar.data : ''} alt="avatar" />
            </div>
            <input name="avatar" type="file"
              onChange={this._onFile('avatar')}/>
          </FormField>
          <FormField>
            <input name="administrator" type="checkbox"
              checked={user.administrator || false}
              onChange={this._onToggle('administrator')}/>
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
  errors: PropTypes.node,
  onRemove: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired
};

UserForm.contextTypes = {
  router: PropTypes.any
};
