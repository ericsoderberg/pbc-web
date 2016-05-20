"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';
import FormTemplateOptionEdit from './FormTemplateOptionEdit';

export default class FormTemplateFieldEdit extends Component {

  constructor (props) {
    super(props);
    const { field, onChange } = props;
    this.state = { formState: new FormState(field, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.field, nextProps.onChange)
    });
  }

  render () {
    const { formState } = this.state;
    const field = formState.object;

    let name, help, required, monetary;

    if ('line' === field.type || 'choice' === field.type ||
      'count' === field.type) {
      monetary = (
        <FormField>
          <input name="monetary" type="checkbox"
            checked={field.monetary || false}
            onChange={formState.toggle('monetary')}/>
          <label htmlFor="monetary">Monetary</label>
        </FormField>
      );
    }

    if ('instructions' === field.type) {

      const textHelp = (
        <a href="http://daringfireball.net/projects/markdown/syntax"
          target="_blank">Markdown syntax</a>
      );
      help = (
        <FormField label="Help" help={textHelp}>
          <textarea name="help" value={field.help || ''} rows={4}
            onChange={formState.change('help')} />
        </FormField>
      );

    } else {

      name = (
        <FormField label="Label">
          <input name="name" value={field.name || ''}
            onChange={formState.change('name')}/>
        </FormField>
      );

      help = (
        <FormField label="Help">
          <input name="help" value={field.help || ''}
            onChange={formState.change('help')}/>
        </FormField>
      );

      required = (
        <FormField>
          <input name="required" type="checkbox"
            checked={field.required || false}
            onChange={formState.toggle('required')}/>
          <label htmlFor="required">Required</label>
        </FormField>
      );

    }

    const options = (field.options || []).map((option, index) => {
      const raise = (index === 0 ? undefined : (
        <button type="button"
          onClick={formState.swapWith('options', index, index-1)}>up</button>
      ));
      const lower = (index === (field.options.length - 1) ? undefined : (
        <button type="button"
          onClick={formState.swapWith('options', index, index+1)}>down</button>
        ));

      return (
        <div key={index}>
          <div className="form__fields-header">
            <legend>{`Option ${index + 1}`}</legend>
            <span>
              {raise}
              {lower}
              <button type="button"
                onClick={formState.removeAt('options', index)}>remove</button>
            </span>
          </div>
          <FormTemplateOptionEdit key={index} option={option} index={index}
            onChange={formState.changeAt('options', index)} />
        </div>
      );
    });

    let addOptionControl;
    if ('choice' === field.type || 'choices' === field.type) {
      addOptionControl = (
        <fieldset className="form__fields">
          <FormField>
            <div className="form__tabs">
              <button type="button" onClick={formState.addTo('options')}>
                Add option
              </button>
            </div>
          </FormField>
        </fieldset>
      );
    }

    return (
      <div>
        <fieldset className="form__fields">
          {name}
          {help}
          {required}
          {monetary}
        </fieldset>
        {options}
        {addOptionControl}
      </div>
    );
  }
};

FormTemplateFieldEdit.propTypes = {
  field: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};
