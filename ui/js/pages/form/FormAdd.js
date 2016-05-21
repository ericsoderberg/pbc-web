"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, postItem } from '../../actions';
import FormError from '../../components/FormError';
import FormField from '../../components/FormField';
import Text from '../../components/Text';

export default class FormAdd extends Component {

  constructor (props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._renderTemplateSection = this._renderTemplateSection.bind(this);
    this._renderTemplateField = this._renderTemplateField.bind(this);
    this.state = {
      form: {
        fields: [],
        formTemplateId: props.formTemplateId || (props.formTemplate || {})._id
      },
      formTemplate: props.formTemplate || {}
    };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ formTemplate: nextProps.formTemplate });
    this._load(nextProps);
  }

  _load (props) {
    if (! props.formTemplate && props.formTemplateId) {
      getItem('form-templates', props.formTemplateId)
      .then(formTemplate => this.setState({ formTemplate: formTemplate }))
      .catch(error => console.log("!!! FormAdd catch", error));
    }
  }

  _onAdd (form) {
    postItem('forms', form)
    .then(response => this.context.router.goBack())
    .catch(error => this.setState({ error: error }));
  }

  _fieldForId (fields, id, found, missed) {
    if ( ! fields.some((field, index) => {
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
      const field = { fieldId: templateFieldId, value: value };
      let form = { ...this.state.form };
      let fields = form.fields.slice(0);
      this._fieldForId(fields, templateFieldId,
        (field, index) => {
          fields[index] = field;
        },
        () => {
          fields.push(field);
        });
      form.fields = fields;
      this.setState({ form: form });
    };
  }

  _renderFormField (templateField, index) {
    let value;
    this._fieldForId(this.state.form.fields, templateField._id,
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
        help={templateField.help}>
        {contents}
      </FormField>
    );
  }

  _renderTemplateField (templateField, index) {
    let result;
    if ('instructions' === templateField.type) {
      result = <Text key={index} text={templateField.help} plain={true} />;
    } else {
      result = this._renderFormField(templateField, index);
    }
    return result;
  }

  _renderTemplateSection (templateSection, index) {
    let name;
    if (templateSection.name) {
      name = <h2>{templateSection.name}</h2>;
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
    const { error } = this.state;
    const formTemplate = this.state.formTemplate || {};

    const sections =
      (formTemplate.sections || []).map(this._renderTemplateSection);

    return (
      <form className="form" action={'/forms'} onSubmit={this._onSubmit}>
        <FormError message={error} />
        {sections}
        <footer className="form__footer">
          <button type="submit" onClick={this._onSubmit}>
            {formTemplate.submitLabel || 'Submit'}
          </button>
        </footer>
      </form>
    );
  }
};

FormAdd.propTypes = {
  formTemplateId: PropTypes.string,
  formTemplate: PropTypes.object
};

FormAdd.contextTypes = {
  router: PropTypes.any
};
