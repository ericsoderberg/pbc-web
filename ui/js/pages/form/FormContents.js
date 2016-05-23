"use strict";
import React, { Component, PropTypes } from 'react';
import FormError from '../../components/FormError';
import FormField from '../../components/FormField';
import Text from '../../components/Text';

export default class FormContents extends Component {

  constructor () {
    super();
    this._renderTemplateSection = this._renderTemplateSection.bind(this);
    this._renderTemplateField = this._renderTemplateField.bind(this);
    this.state = {};
  }

  _fieldForId (fields, id, found, missed) {
    if ( ! (fields || []).some((field, index) => {
      if (field.fieldId === id) {
        found(field, index);
        return true;
      }
    })) {
      missed();
    }
  }

  _change (templateFieldId) {
    return (event) => {
      const value = event.target.value;
      const nextField = { fieldId: templateFieldId, value: value };
      let form = { ...this.props.form };
      let fields = form.fields.slice(0);
      this._fieldForId(fields, templateFieldId,
        (field, index) => {
          fields[index] = nextField;
        },
        () => {
          fields.push(nextField);
        });
      form.fields = fields;
      this.props.onChange(form);
    };
  }

  _renderFormField (templateField, index) {
    const error = this.props.error || {};
    let value;
    this._fieldForId(this.props.form.fields, templateField._id,
      (field, index) => {
        value = field.value;
      },
      () => {
        value = '';
      });

    let contents;
    if ('line' === templateField.type) {
      contents = (
        <input name={templateField.name} value={value} type="text"
          onChange={this._change(templateField._id)} />
      );
    } else if ('lines' === templateField.type) {
      contents = (
        <textarea name={templateField.name} value={value}
          onChange={this._change(templateField._id)} />
      );
    } else if ('choice' === templateField.type) {
      contents = (templateField.options || []).map((option, index) => (
        <div key={index}>
          <input name={templateField.name} type="radio"
            checked={value || false}
            onChange={this._change(templateField._id)}/>
          <label htmlFor={templateField.name}>{option.name}</label>
        </div>
      ));
    } else if ('choices' === templateField.type) {
      contents = (templateField.options || []).map((option, index) => (
        <div key={index}>
          <input name={templateField.name} type="checkbox"
            checked={value || false}
            onChange={this._change(templateField._id)}/>
          <label htmlFor={templateField.name}>{option.name}</label>
        </div>
      ));
    } else if ('count' === templateField.type) {
      contents = (
        <input name={templateField.name} value={value} type="text"
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
    let name;
    if (templateSection.name) {
      name = (
        <div className="form__text">
          <h2>{templateSection.name}</h2>
        </div>
      );
    }
    const fields =
      (templateSection.fields || []).map(this._renderTemplateField);
    return (
      <fieldset key={index} className="form-fields">
        {name}
        {fields}
      </fieldset>
    );
  }

  render () {
    const { formTemplate, error } = this.props;

    let formError;
    if (error && typeof error === 'string') {
      formError = <FormError message={error} />;
    }

    const sections =
    (formTemplate.sections || []).map(this._renderTemplateSection);

    return (
      <div>
        {formError}
        {sections}
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
  onChange: PropTypes.func.isRequired
};
