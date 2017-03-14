
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';

export default class FormTemplateOptionEdit extends Component {

  constructor(props) {
    super(props);
    const { option, onChange } = props;
    this.state = { formState: new FormState(option, onChange) };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      formState: new FormState(nextProps.option, nextProps.onChange),
    });
  }

  render() {
    const { field } = this.props;
    const { formState } = this.state;
    const option = formState.object;

    let prefix;
    if (field.monetary) {
      prefix = <span className="prefix">$</span>;
    }

    let required;
    if (field.type === 'choices') {
      required = (
        <FormField>
          <input name="required" type="checkbox"
            checked={option.required || false}
            onChange={formState.toggle('required')} />
          <label htmlFor="required">Required</label>
        </FormField>
      );
    }

    return (
      <div>
        <fieldset className="form__fields">
          <FormField label="Label">
            <input name="name" value={option.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField label="Value">
            <div className="box--row">
              {prefix}
              <input name="value" value={option.value || ''}
                onChange={formState.change('value')} />
            </div>
          </FormField>
          <FormField label="Help">
            <textarea name="help" value={option.help || ''} rows={1}
              onChange={formState.change('help')} />
          </FormField>
          {required}
          <FormField label="Total available">
            <input name="limit" type="number" min="0" value={option.limit || ''}
              onChange={formState.change('limit')} />
          </FormField>
        </fieldset>
      </div>
    );
  }
}

FormTemplateOptionEdit.propTypes = {
  field: PropTypes.object.isRequired,
  option: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
