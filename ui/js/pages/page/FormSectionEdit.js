"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';
import SectionFields from './SectionFields';

export default class FormSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange), formTemplates: [] };
  }

  componentDidMount () {
    getItems('form-templates')
    .then(formTemplates => this.setState({ formTemplates: formTemplates }));
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange)
    });
  }

  render () {
    const { formState } = this.state;
    const section = formState.object;

    const formTemplates = this.state.formTemplates.map(formTemplate => (
      <option key={formTemplate._id} label={formTemplate.name} value={formTemplate._id} />
    ));
    formTemplates.unshift(<option key={0} />);

    return (
      <fieldset className="form__fields">
        <FormField name="formTemplateId" label="Form template">
          <select name="formTemplateId" value={section.formTemplateId || ''}
            onChange={formState.change('formTemplateId')}>
            {formTemplates}
          </select>
        </FormField>
        <SectionFields formState={formState} />
      </fieldset>
    );
  }
};

FormSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
