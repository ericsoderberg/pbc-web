"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import DownIcon from '../../icons/Down';
import UpIcon from '../../icons/Up';
import TrashIcon from '../../icons/Trash';
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
    const { dependableFields } = this.props;
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
        <button type="button" className="button-icon"
          onClick={formState.swapWith('options', index, index-1)}>
          <UpIcon />
        </button>
      ));
      const lower = (index === (field.options.length - 1) ? undefined : (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('options', index, index+1)}>
          <DownIcon />
        </button>
        ));

      return (
        <div key={index}>
          <div className="form__fields-header">
            <legend>{`Option ${index + 1}`}</legend>
            <span className="form__fields-header-actions">
              {raise}
              {lower}
              <button type="button" className="button-icon"
                onClick={formState.removeAt('options', index)}>
                <TrashIcon />
              </button>
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
              <button type="button" className="button button--secondary"
                onClick={formState.addTo('options')}>
                Add option
              </button>
            </div>
          </FormField>
        </fieldset>
      );
    }

    let dependsOnOptions = dependableFields.map(dependableField => (
      <option key={dependableField.id} label={dependableField.name}
        value={dependableField.id} />
    ));
    dependsOnOptions.unshift(<option key={0} />);
    const dependsOn = (
      <FormField label="Depends on">
        <select name="dependsOnId" value={field.dependsOnId || ''}
          onChange={formState.change('dependsOnId')}>
          {dependsOnOptions}
        </select>
      </FormField>
    );

    return (
      <div>
        <fieldset className="form__fields">
          {name}
          {help}
          {required}
          {monetary}
          {dependsOn}
        </fieldset>
        {options}
        {addOptionControl}
      </div>
    );
  }
};

FormTemplateFieldEdit.propTypes = {
  dependableFields: PropTypes.arrayOf(PropTypes.object),
  field: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};
