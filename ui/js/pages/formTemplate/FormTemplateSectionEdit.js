"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import AddIcon from '../../icons/Add';
import DownIcon from '../../icons/Down';
import UpIcon from '../../icons/Up';
import TrashIcon from '../../icons/Trash';
import FormState from '../../utils/FormState';
import FormTemplateFieldEdit from './FormTemplateFieldEdit';

const FIELD_TYPES = ['line', 'lines', 'choice', 'choices', 'count',
  'instructions'];

export default class FormTemplateSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = {
      expandAdd: false,
      expandedFields: {}, // _id or id
      formState: new FormState(section, onChange),
      newFieldId: 1
    };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange)
    });
  }

  _toggleField (id) {
    return () => {
      let expandedFields = { ...this.state.expandedFields };
      expandedFields[id] = ! expandedFields[id];
      this.setState({ expandedFields: expandedFields });
    };
  }

  render () {
    const { includeName } = this.props;
    const { formState, expandedFields, expandAdd } = this.state;
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
        <button type="button" className="button--icon"
          onClick={formState.swapWith('fields', index, index-1)}>
          <UpIcon />
        </button>
      ));
      const lower = (index === (section.fields.length - 1) ? undefined : (
        <button type="button" className="button--icon"
          onClick={formState.swapWith('fields', index, index+1)}>
          <DownIcon />
        </button>
        ));

      let edit;
      if (expandedFields[field._id] || expandedFields[field.id]) {
        edit = (
          <FormTemplateFieldEdit key={index} field={field} index={index}
            onChange={formState.changeAt('fields', index)} />
        );
      }

      return (
        <div key={index}>
          <div className="form__fields-header">
            <h4 className="form__fields-header-label"
              onClick={this._toggleField(field._id || field.id)}>
              {field.name || field.type}
            </h4>
            <span className="form__fields-header-actions">
              {raise}
              {lower}
              <button type="button" className="button--icon"
                onClick={formState.removeAt('fields', index)}>
                <TrashIcon />
              </button>
            </span>
          </div>
          {edit}
        </div>
      );
    });

    let add;
    if (expandAdd) {

      const addControls = FIELD_TYPES.map(type => (
        <button key={type} type="button"
          onClick={formState.addTo('fields', () => {
            const id = this.state.newFieldId;
            this.setState({ newFieldId: this.state.newFieldId + 1 });
            return { type: type, id: id };
          })}>
          {type}
        </button>
      ));

      add = (
        <fieldset className="form__fields"
          onClick={() => this.setState({ expandAdd: false })}>
          <FormField label="Add field">
            <div className="form__tabs">
              {addControls}
            </div>
          </FormField>
        </fieldset>
      );

    } else {

      add = (
        <div className="form__fields-header">
          <button type="button" className="button--icon"
            onClick={() => this.setState({ expandAdd: true })}>
            <AddIcon />
          </button>
        </div>
      );

    }

    return (
      <div>
        {name}
        {fields}
        {add}
      </div>
    );
  }
};

FormTemplateSectionEdit.propTypes = {
  includeName: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
