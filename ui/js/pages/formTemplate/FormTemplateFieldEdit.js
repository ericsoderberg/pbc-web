
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import Button from '../../components/Button';
import TextHelp from '../../components/TextHelp';
import DownIcon from '../../icons/Down';
import UpIcon from '../../icons/Up';
import TrashIcon from '../../icons/Trash';
import FormState from '../../utils/FormState';
import FormTemplateOptionEdit from './FormTemplateOptionEdit';

const LINK_TO_USER_FIELDS = {
  name: /name/i,
  email: /email/i,
  phone: /phone/i,
};

export default class FormTemplateFieldEdit extends Component {

  constructor(props) {
    super(props);
    const { field, onChange } = props;
    this.state = {
      formState: new FormState(field, onChange),
      newOptionId: 1,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      formState: new FormState(nextProps.field, nextProps.onChange),
    });
  }

  _addOption() {
    return this.state.formState.addTo('options', () => {
      const id = this.state.newOptionId;
      this.setState({ newOptionId: this.state.newOptionId + 1 });
      return { id };
    });
  }

  render() {
    const { dependableFields, linkedToFormTemplate } = this.props;
    const { formState } = this.state;
    const field = formState.object;

    let name;
    let help;
    let value;
    let required;
    let monetary;
    let discount;
    let limit;
    let max;
    let min;
    let sessionField;

    if (field.type === 'line' || field.type === 'choice' ||
      field.type === 'choices' || field.type === 'count' ||
      field.type === 'number') {
      monetary = (
        <FormField>
          <input name="monetary" type="checkbox"
            checked={field.monetary || false}
            onChange={formState.toggle('monetary')} />
          <label htmlFor="monetary">Monetary</label>
        </FormField>
      );
    }

    if (field.type === 'count' || field.type === 'number') {
      let prefix;
      if (field.monetary) {
        prefix = <span className="prefix">$</span>;
      }
      value = (
        <FormField label="Unit value">
          <div className="box--row">
            {prefix}
            <input name="value" value={field.value || ''}
              onChange={formState.change('value')} />
          </div>
        </FormField>
      );

      limit = (
        <FormField label="Total available">
          <input name="limit" type="number" min="0" value={field.limit || ''}
            onChange={formState.change('limit')} />
        </FormField>
      );
      min = (
        <FormField label="Minimum">
          <input name="min" type="number" min="0" value={field.min || ''}
            onChange={formState.change('min')} />
        </FormField>
      );
      max = (
        <FormField label="Maximum">
          <input name="max" type="number" min="0" value={field.max || ''}
            onChange={formState.change('max')} />
        </FormField>
      );
    }

    if ((field.type === 'line' || field.type === 'number') && field.monetary) {
      discount = (
        <FormField>
          <input name="discount" type="checkbox"
            checked={field.discount || false}
            onChange={formState.toggle('discount')} />
          <label htmlFor="discount">Discount</label>
        </FormField>
      );
    }

    if (field.type === 'line') {
      Object.keys(LINK_TO_USER_FIELDS).some((fieldName) => {
        const regexp = LINK_TO_USER_FIELDS[fieldName];
        if (field.name.match(regexp)) {
          sessionField = (
            <FormField>
              <input name="sessionField" type="checkbox"
                checked={field.linkToUserProperty === fieldName}
                onChange={() => formState.set('linkToUserProperty',
                  (field.linkToUserProperty === fieldName) ?
                  undefined : fieldName)
                } />
              <label htmlFor="sessionField">
                Tie to session user {fieldName}
              </label>
            </FormField>
          );
          return true;
        }
        return false;
      });
    }

    if (field.type === 'instructions') {
      help = (
        <FormField label="Help" help={<TextHelp />}>
          <textarea name="help" value={field.help || ''} rows={4}
            onChange={formState.change('help')} />
        </FormField>
      );
    } else {
      name = (
        <FormField label="Label">
          <input name="name" value={field.name || ''}
            onChange={formState.change('name')} />
        </FormField>
      );

      help = (
        <FormField label="Help">
          <textarea name="help" value={field.help || ''} rows={1}
            onChange={formState.change('help')} />
        </FormField>
      );

      required = (
        <FormField>
          <input name="required" type="checkbox"
            checked={field.required || false}
            onChange={formState.toggle('required')} />
          <label htmlFor="required">Required</label>
        </FormField>
      );
    }

    const options = (field.options || []).map((option, index) => {
      const raise = (index === 0 ? undefined : (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('options', index, index - 1)}>
          <UpIcon />
        </button>
      ));
      const lower = (index === (field.options.length - 1) ? undefined : (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('options', index, index + 1)}>
          <DownIcon />
        </button>
      ));

      return (
        <div key={option._id || option.id}>
          <div className="form-item">
            <legend>{`Option ${index + 1}`}</legend>
            <div className="box--row">
              {raise}
              {lower}
              <button type="button" className="button-icon"
                onClick={formState.removeAt('options', index)}>
                <TrashIcon />
              </button>
            </div>
          </div>
          <FormTemplateOptionEdit option={option} index={index}
            onChange={formState.changeAt('options', index)} />
        </div>
      );
    });

    let addOptionControl;
    if (field.type === 'choice' || field.type === 'choices') {
      addOptionControl = (
        <fieldset className="form__fields">
          <FormFieldAdd>
            <Button label="Add option" secondary={true}
              onClick={this._addOption()} />
          </FormFieldAdd>
        </fieldset>
      );
    }

    const dependsOnOptions = dependableFields
    .filter(dependableField => (
      dependableField.id !== (field._id || field.id)
    ))
    .map(dependableField => (
      <option key={dependableField._id || dependableField.id}
        label={dependableField.name}
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

    let linkedField;
    if (linkedToFormTemplate) {
      const linkedFieldOptions = [];
      linkedToFormTemplate.sections.forEach(section2 =>
        section2.fields.forEach((field2) => {
          if (field2.type === field.type) {
            linkedFieldOptions.push(
              <option key={field2._id}
                label={`${section2.name} ${field2.name}`} value={field2._id} />,
            );
          }
        }),
      );
      linkedFieldOptions.unshift(<option key={0} />);
      linkedField = (
        <FormField label="Linked to"
          help={`Link the value of this field to a field in the depended
            on form`}>
          <select name="linkedFieldId" value={field.linkedFieldId || ''}
            onChange={formState.change('linkedFieldId')}>
            {linkedFieldOptions}
          </select>
        </FormField>
      );
    }

    return (
      <div>
        <fieldset className="form__fields">
          {name}
          {help}
          {min}
          {max}
          {value}
          {limit}
          {required}
          {monetary}
          {discount}
          {sessionField}
          {dependsOn}
          {linkedField}
        </fieldset>
        {options}
        {addOptionControl}
      </div>
    );
  }
}

FormTemplateFieldEdit.propTypes = {
  dependableFields: PropTypes.arrayOf(PropTypes.object),
  linkedToFormTemplate: PropTypes.object,
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

FormTemplateFieldEdit.defaultProps = {
  dependableFields: [],
  linkedToFormTemplate: undefined,
};
