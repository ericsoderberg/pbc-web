"use strict";
import React, { Component, PropTypes } from 'react';
import FormError from '../../components/FormError';
import FormField from '../../components/FormField';
import SelectSearch from '../../components/SelectSearch';
import Text from '../../components/Text';
import Stored from '../../components/Stored';

const UserSuggestion = (props) => (
  <div className="box--between">
    <span>{props.item.name}</span>
    <span className="secondary">{props.item.email}</span>
  </div>
);

class FormContents extends Component {

  constructor (props) {
    super(props);
    this._renderTemplateSection = this._renderTemplateSection.bind(this);
    this._renderTemplateField = this._renderTemplateField.bind(this);
    this.state = { fieldsSet: this._fieldsSetFromProps(props) };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ fieldsSet: this._fieldsSetFromProps(nextProps) });
  }

  _fieldsSetFromProps (props) {
    let fieldsSet = {};
    props.form.fields.forEach(field => {
      if (field.value || field.optionId ||
        (field.optionIds && field.optionIds.length > 0)) {
        fieldsSet[field.fieldId] = true;
      }
    });
    return fieldsSet;
  }

  _fieldIndex (id) {
    const { form: { fields } } = this.props;
    let result = -1;
    fields.some((field, index) => {
      if (field.fieldId === id) {
        result = index;
        return true;
      }
    });
    return result;
  }

  _change (templateFieldId) {
    return (event) => {
      const value = event.target.value;
      const nextField = { fieldId: templateFieldId, value: value };
      let form = { ...this.props.form };
      let fields = form.fields.slice(0);
      const index = this._fieldIndex(templateFieldId);
      if (index === -1) {
        fields.push(nextField);
      } else {
        fields[index] = nextField;
      }
      form.fields = fields;
      this.props.onChange(form);
    };
  }

  _setOption (templateFieldId, optionId) {
    return (event) => {
      const nextField = { fieldId: templateFieldId, optionId: optionId };
      let form = { ...this.props.form };
      let fields = form.fields.slice(0);
      const index = this._fieldIndex(templateFieldId);
      if (index === -1) {
        fields.push(nextField);
      } else {
        fields[index] = nextField;
      }
      form.fields = fields;
      this.props.onChange(form);
    };
  }

  _toggleOption (templateFieldId, optionId) {
    return (event) => {
      let form = { ...this.props.form };
      let fields = form.fields.slice(0);
      const index = this._fieldIndex(templateFieldId);
      if (index === -1) {
        fields.push({ fieldId: templateFieldId, optionIds: [optionId] });
      } else {
        let optionIds = fields[index].optionIds.slice(0);
        let optionIndex = optionIds.indexOf(optionId);
        if (optionIndex === -1) {
          optionIds.push(optionId);
        } else {
          optionIds.splice(optionIndex, 1);
        }
        fields[index] = { fieldId: templateFieldId, optionIds: optionIds };
      }
      form.fields = fields;
      this.props.onChange(form);
    };
  }

  _renderFormField (templateField, index) {
    const { form: { fields } } = this.props;
    const error = this.props.error || {};
    const fieldIndex = this._fieldIndex(templateField._id);
    const field = fields[fieldIndex] || {};

    let contents;
    if ('line' === templateField.type) {
      contents = (
        <input name={templateField.name} value={field.value || ''} type="text"
          onChange={this._change(templateField._id)} />
      );
    } else if ('lines' === templateField.type) {
      contents = (
        <textarea name={templateField.name} value={field.value || ''}
          onChange={this._change(templateField._id)} />
      );
    } else if ('choice' === templateField.type) {
      contents = (templateField.options || []).map((option, index) => (
        <div key={index}>
          <input name={templateField.name} type="radio"
            checked={field.optionId === option._id}
            onChange={this._setOption(templateField._id, option._id)}/>
          <label htmlFor={templateField.name}>{option.name}</label>
        </div>
      ));
    } else if ('choices' === templateField.type) {
      const optionIds = field.optionIds || [];
      contents = (templateField.options || []).map((option, index) => (
        <div key={index}>
          <input name={templateField.name} type="checkbox"
            checked={optionIds.indexOf(option._id) !== -1}
            onChange={this._toggleOption(templateField._id, option._id)}/>
          <label htmlFor={templateField.name}>{option.name}</label>
        </div>
      ));
    } else if ('count' === templateField.type) {
      contents = (
        <input name={templateField.name} value={field.value || ''} type="text"
          onChange={this._change(templateField._id)} />
      );
    }

    return (
      <FormField key={index} label={templateField.name}
        help={templateField.help} error={error[templateField._id]}>
        {contents}
      </FormField>
    );
  }

  _renderTemplateField (templateField, index) {
    let result;
    if ('instructions' === templateField.type) {
      result = (
        <div key={index} className="form__text">
          <Text text={templateField.help} plain={true} />
        </div>
      );
    } else {
      result = this._renderFormField(templateField, index);
    }
    return result;
  }

  _renderTemplateSection (templateSection, index) {
    const { fieldsSet } = this.state;
    let name;
    if (templateSection.name) {
      name = (
        <div className="form__text">
          <h2>{templateSection.name}</h2>
        </div>
      );
    }
    const fields = (templateSection.fields || [])
    .filter(templateField => (
      ! templateField.dependsOnId || fieldsSet[templateField.dependsOnId]
    ))
    .map(this._renderTemplateField);
    return (
      <fieldset key={index} className="form-fields">
        {name}
        {fields}
      </fieldset>
    );
  }

  render () {
    const { form, formTemplate, full, error, session } = this.props;
    const { fieldsSet } = this.state;

    let formError;
    if (error && (typeof error === 'string' || error.error)) {
      formError = <FormError message={error} />;
    }

    const sections = (formTemplate.sections || [])
    .filter(section => ! section.dependsOnId || fieldsSet[section.dependsOnId])
    .map(this._renderTemplateSection);

    let user;
    if (full && session && (session.administrator || (formTemplate.domainId &&
      session.administratorDomainId === formTemplate.domainId))) {
      user = (
        <fieldset className="form__fields">
          <FormField label="Person" help="the person to submit this form for">
            <SelectSearch category="users"
              options={{select: 'name email', sort: 'name'}}
              Suggestion={UserSuggestion}
              value={(form.userId || session).name || ''}
              onChange={(suggestion) => {
                form.userId = suggestion;
                this.props.onChange(form);
              }} />
          </FormField>
        </fieldset>
      );
    }

    return (
      <div>
        {formError}
        {sections}
        {user}
      </div>
    );
  }
};

FormContents.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  form: PropTypes.shape({
    fields: PropTypes.arrayOf(PropTypes.object).isRequired
  }).isRequired,
  formTemplate: PropTypes.shape({
    sections: PropTypes.arrayOf(PropTypes.object)
  }).isRequired,
  full: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string,
    name: PropTypes.string
  })
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(FormContents, select);
