"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';

export default class UserSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange), users: [] };
  }

  componentDidMount () {
    getItems('users')
    .then(users => this.setState({ users: users }));
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange)
    });
  }

  render () {
    const { formState } = this.state;
    const section = formState.object;

    const users = this.state.users.map(user => (
      <option key={user._id} label={user.name} value={user._id} />
    ));
    users.unshift(<option key={0} />);

    return (
      <fieldset className="form__fields">
        <FormField name="user" label="User">
          <select name="objectId" value={section.objectId || ''}
            onChange={formState.change('objectId')}>
            {users}
          </select>
        </FormField>
        <FormField>
          <input name="full" type="checkbox"
            checked={section.full || false}
            onChange={formState.toggle('full')}/>
          <label htmlFor="full">Edge to edge</label>
        </FormField>
        <FormField label="Background color">
          <input ref="color" name="color" value={section.color || ''}
            onChange={formState.change('color')}/>
        </FormField>
      </fieldset>
    );
  }
};

UserSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
