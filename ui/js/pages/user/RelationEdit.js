"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import DateInput from '../../components/DateInput';
import TextHelp from '../../components/TextHelp';
import FormState from '../../utils/FormState';

export default class RelationEdit extends Component {

  constructor (props) {
    super(props);
    const { relation, onChange } = props;
    this.state = { formState: new FormState(relation, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.relation, nextProps.onChange)
    });
  }

  render () {
    const { formState } = this.state;
    const relation = formState.object;

    return (
      <fieldset className="form__fields">
        <FormField label="Name">
          <input name="name"
            value={relation.name || ''}
            onChange={formState.change('name')}/>
        </FormField>
        <FormField label="Relationship">
          <input name="relationship"
            value={relation.relationship || ''}
            onChange={formState.change('relationship')}/>
        </FormField>
        <FormField label="Birthday">
          <DateInput value={relation.birthday || ''}
            onChange={formState.change('birthday')} />
        </FormField>
        <FormField label="Grade">
          <input name="grade"
            value={relation.grade || ''}
            onChange={formState.change('grade')}/>
        </FormField>
        <FormField name="notes" label="Notes" help={<TextHelp />}>
          <textarea name="notes" value={relation.notes || ''} rows={4}
            onChange={formState.change('notes')}/>
        </FormField>
      </fieldset>
    );
  }
};

RelationEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  relation: PropTypes.object.isRequired
};
