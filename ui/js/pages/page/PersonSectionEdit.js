"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import SelectSearch from '../../components/SelectSearch';
import FormState from '../../utils/FormState';
import SectionFields from './SectionFields';

export default class PersonSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange), users: [] };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange)
    });
  }

  render () {
    const { formState } = this.state;
    const section = formState.object;

    return (
      <fieldset className="form__fields">
        <FormField name="user" label="Person">
          <SelectSearch category="users"
            options={{ select: 'name' }}
            value={(section.userId || {}).name || ''}
            onChange={(suggestion) =>
              formState.change('userId')({
                _id: suggestion._id, name: suggestion.name })} />
        </FormField>
        <SectionFields formState={formState} />
      </fieldset>
    );
  }
};

PersonSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};