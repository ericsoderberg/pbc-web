
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
    const { formState } = this.state;
    const option = formState.object;

    return (
      <div>
        <fieldset className="form__fields">
          <FormField label="Label">
            <input name="name" value={option.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField label="Value">
            <input name="value" value={option.value || ''}
              onChange={formState.change('value')} />
          </FormField>
        </fieldset>
      </div>
    );
  }
}

FormTemplateOptionEdit.propTypes = {
  option: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
