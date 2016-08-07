"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import ImageField from '../../components/ImageField';

export default class UserFormContents extends Component {

  constructor () {
    super();
    this.state = { domains: [] };
  }

  componentDidMount () {
    this.refs.name.focus();

    getItems('domains')
    .then(response => this.setState({ domains: response }))
    .catch(error => console.log('UserFormContents catch', error));
  }

  render () {
    const { formState, session } = this.props;
    const user = formState.object;

    const textHelp = (
      <a href="http://daringfireball.net/projects/markdown/syntax"
        target="_blank">Markdown syntax</a>
    );

    let domains = this.state.domains.map(domain => (
      <option key={domain._id} label={domain.name} value={domain._id} />
    ));
    domains.unshift(<option key={0} />);

    let adminFields;
    if (session.administrator) {
      adminFields = [
        <FormField key="administrator">
          <input name="administrator" type="checkbox"
            checked={user.administrator || false}
            onChange={formState.toggle('administrator')}/>
          <label htmlFor="administrator">Administrator</label>
        </FormField>,
        <FormField key="administratorDomainId" label="Administor for">
          <select name="administratorDomainId"
            value={user.administratorDomainId || ''}
            onChange={formState.change('administratorDomainId')}>
            {domains}
          </select>
        </FormField>
      ];
    }

    return (
      <fieldset className="form__fields">
        <FormField label="Name">
          <input ref="name" name="name" value={user.name || ''}
            onChange={formState.change('name')}/>
        </FormField>
        <FormField name="email" label="Email">
          <input name="email" value={user.email || ''}
            onChange={formState.change('email')}/>
        </FormField>
        <FormField name="password" label="Password">
          <input name="password" type="password" value={user.password || ''}
            onChange={formState.change('password')}/>
        </FormField>
        <ImageField label="Photo" name="avatar"
          formState={formState} property="avatar" />
        <FormField name="text" label="Text" help={textHelp}>
          <textarea ref="text" name="text" value={user.text || ''} rows={8}
            onChange={formState.change('text')}/>
        </FormField>
        {adminFields}
      </fieldset>
    );
  }
};

UserFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
