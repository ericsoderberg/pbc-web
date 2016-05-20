"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';
import FormTemplateFieldEdit from './FormTemplateFieldEdit';

const FIELD_TYPES = ['line', 'lines', 'choice', 'choices', 'count',
  'instructions'];

export default class FormTemplateSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange)
    });
  }

  render () {
    const { includeName } = this.props;
    const { formState } = this.state;
    const section = formState.object;

    let name;
    if (includeName) {
      name = (
        <fieldset className="form__fields">
          <FormField label="Section name">
            <input name="name" value={section.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
        </fieldset>
      );
    }

    const fields = (section.fields || []).map((field, index) => {

      const raise = (index === 0 ? undefined : (
        <button type="button"
          onClick={formState.swapWith('fields', index, index-1)}>up</button>
      ));
      const lower = (index === (section.fields.length - 1) ? undefined : (
        <button type="button"
          onClick={formState.swapWith('fields', index, index+1)}>down</button>
        ));

      return (
        <div key={index}>
          <div className="form__fields-header">
            <legend>{field.type}</legend>
            <span>
              {raise}
              {lower}
              <button type="button"
                onClick={formState.removeAt('fields', index)}>remove</button>
            </span>
          </div>
          <FormTemplateFieldEdit key={index} field={field} index={index}
            onChange={formState.changeAt('fields', index)} />
        </div>
      );
    });

    const addControls = FIELD_TYPES.map(type => (
      <button key={type} type="button"
        onClick={formState.addTo('fields', { type: type })}>
        {type}
      </button>
    ));

    return (
      <div>
        {name}
        {fields}
        <fieldset className="form__fields">
          <FormField label="Add field">
            <div className="form__tabs">
              {addControls}
            </div>
          </FormField>
        </fieldset>
      </div>
    );
  }
};

FormTemplateSectionEdit.propTypes = {
  includeName: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
