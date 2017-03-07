
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Markdown from 'markdown-to-jsx';
import moment from 'moment';
import FormError from '../../components/FormError';
import FormField from '../../components/FormField';
import SelectSearch from '../../components/SelectSearch';
// import Text from '../../components/Text';
import Stored from '../../components/Stored';
import FormTotal from './FormTotal';

const UserSuggestion = props => (
  <div className="box--between">
    <span>{props.item.name}</span>
    <span className="secondary">{props.item.email}</span>
  </div>
);

UserSuggestion.propTypes = {
  item: PropTypes.shape({
    email: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
};

class FormContents extends Component {

  constructor(props) {
    super(props);
    this._renderTemplateSection = this._renderTemplateSection.bind(this);
    this._renderTemplateField = this._renderTemplateField.bind(this);
    this.state = this._stateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this._stateFromProps(nextProps));
  }

  _stateFromProps(props) {
    const fieldsSet = {};
    props.form.fields.forEach((field) => {
      if (field.value || field.optionId ||
        (field.optionIds && field.optionIds.length > 0)) {
        fieldsSet[field.templateFieldId] = true;
      }
    });
    const administrator = (props.session &&
      (props.session.administrator || (
        (props.formTemplate && props.formTemplate.domainId &&
        props.session.administratorDomainId === props.formTemplate.domainId))));
    return { administrator, fieldsSet };
  }

  _fieldIndex(templateFieldId, childId) {
    const { form: { fields } } = this.props;
    let result = -1;
    fields.some((field, index) => {
      if (field.templateFieldId === templateFieldId &&
        (!field.childId || field.childId === childId)) {
        result = index;
        return true;
      }
      return false;
    });
    return result;
  }

  _change(templateFieldId, childId) {
    return (event) => {
      const value = event.target.value;
      const nextField = { templateFieldId, value };
      if (childId) {
        nextField.childId = childId;
      }
      const form = { ...this.props.form };
      const fields = form.fields.slice(0);
      const index = this._fieldIndex(templateFieldId, childId);
      if (index === -1) {
        fields.push(nextField);
      } else {
        fields[index] = nextField;
      }
      form.fields = fields;
      this.props.onChange(form);
    };
  }

  _setOption(templateFieldId, childId, optionId) {
    return () => {
      const nextField = { templateFieldId, optionId };
      if (childId) {
        nextField.childId = childId;
      }
      const form = { ...this.props.form };
      const fields = form.fields.slice(0);
      const index = this._fieldIndex(templateFieldId, childId);
      if (index === -1) {
        fields.push(nextField);
      } else {
        fields[index] = nextField;
      }
      form.fields = fields;
      this.props.onChange(form);
    };
  }

  _toggleOption(templateFieldId, childId, optionId) {
    return () => {
      const form = { ...this.props.form };
      const fields = form.fields.slice(0);
      const index = this._fieldIndex(templateFieldId, childId);
      if (index === -1) {
        const nextField = { templateFieldId, optionIds: [optionId] };
        if (childId) {
          nextField.childId = childId;
        }
        fields.push(nextField);
      } else {
        const optionIds = fields[index].optionIds.slice(0);
        const optionIndex = optionIds.indexOf(optionId);
        if (optionIndex === -1) {
          optionIds.push(optionId);
        } else {
          optionIds.splice(optionIndex, 1);
        }
        const field = { templateFieldId, optionIds };
        if (childId) {
          field.childId = childId;
        }
        fields[index] = field;
      }
      form.fields = fields;
      this.props.onChange(form);
    };
  }

  _renderOptionLabel(templateField, option, selected) {
    let label;
    if (templateField.monetary && option.value) {
      const classes = ['form__field-option-amount'];
      if (selected) {
        classes.push('primary');
      } else {
        classes.push('tertiary');
      }
      label = [
        <span key="name">{option.name}</span>,
        <span key="amount" className={classes.join(' ')}>
          $ {option.value}
        </span>,
      ];
    } else {
      label = <span>{option.name}</span>;
    }
    return label;
  }

  _renderFormField(templateField, childId) {
    const { form: { fields } } = this.props;
    const error = this.props.error || {};
    const fieldIndex = this._fieldIndex(templateField._id, childId);
    const field = fields[fieldIndex] || {};
    const name = `${templateField.name}${childId ? `-${childId}` : ''}`;

    let contents;
    if (templateField.type === 'line') {
      contents = (
        <input name={name} type="text" value={field.value || ''}
          onChange={this._change(templateField._id, childId)} />
      );
      if (templateField.monetary) {
        let amount;
        if (field.value) {
          amount = (
            <span className="form__field-option-amount primary">
              $ {field.value}
            </span>
          );
        }
        contents = (
          <div className="box--row">
            <span className="prefix">$</span>
            {contents}
            {amount}
          </div>
        );
      }
    } else if (templateField.type === 'lines') {
      contents = (
        <textarea name={name} value={field.value || ''}
          onChange={this._change(templateField._id, childId)} />
      );
    } else if (templateField.type === 'choice') {
      contents = (templateField.options || []).map((option) => {
        const checked = (field.optionId === option._id);
        const label = this._renderOptionLabel(templateField, option, checked);
        return (
          <div key={option._id || option.id} className="form__field-option">
            <input name={name} type="radio" checked={checked}
              onChange={this._setOption(templateField._id, childId, option._id)} />
            <label htmlFor={templateField.name}>{label}</label>
          </div>
        );
      });
    } else if (templateField.type === 'choices') {
      const optionIds = field.optionIds || [];
      contents = (templateField.options || []).map((option) => {
        const checked = (optionIds.indexOf(option._id) !== -1);
        const label = this._renderOptionLabel(templateField, option, checked);
        return (
          <div key={option._id || option.id} className="form__field-option">
            <input name={name} type="checkbox" checked={checked}
              onChange={this._toggleOption(templateField._id, childId, option._id)} />
            <label htmlFor={templateField.name}>{label}</label>
          </div>
        );
      });
    } else if (templateField.type === 'count') {
      contents = (
        <input name={name} type="number"
          min={templateField.min || 0} max={templateField.max}
          value={field.value || templateField.min || 0}
          onChange={this._change(templateField._id, childId)} />
      );
      if (templateField.value) {
        const prefix =
          `${templateField.monetary ? '$' : ''}${templateField.value}`;
        const amount =
          `${templateField.monetary ? '$ ' : ''}` +
          `${(field.value || 0) * templateField.value}`;
        const amountClasses = ['form__field-option-amount'];
        if (field.value > 0) {
          amountClasses.push('primary');
        } else {
          amountClasses.push('tertiary');
        }
        contents = (
          <div className="box--row">
            <span className="prefix">{prefix}</span>
            <span className="prefix">x</span>
            {contents}
            <span className={amountClasses.join(' ')}>{amount}</span>
          </div>
        );
      }
    }

    return (
      <FormField key={name} label={templateField.name}
        help={templateField.help} error={error[templateField._id]}>
        {contents}
      </FormField>
    );
  }

  _renderTemplateField(templateField, childId) {
    let result;
    if (templateField.type === 'instructions') {
      result = (
        <div key={templateField._id} className="form__text">
          <Markdown>{templateField.help}</Markdown>
        </div>
      );
    } else {
      result = this._renderFormField(templateField, childId);
    }
    return result;
  }

  _renderTemplateSection(templateSection) {
    const { family } = this.props;
    const { fieldsSet } = this.state;

    const sectionFields = (templateSection.fields || [])
    .filter(templateField => (
      !templateField.dependsOnId || fieldsSet[templateField.dependsOnId]
    ));

    if (family && templateSection.child) {
      return family.children.map((child) => {
        const fields = sectionFields.map(sectionField =>
          this._renderTemplateField(sectionField, child._id));
        return (
          <fieldset key={child.name} className="form__fields">
            <div className="form__text">
              <h2>{child.name}</h2>
            </div>
            {fields}
          </fieldset>
        );
      });
    }

    let name;
    if (templateSection.name) {
      name = (
        <div className="form__text">
          <h2>{templateSection.name}</h2>
        </div>
      );
    }

    const fields = sectionFields.map(sectionField =>
      this._renderTemplateField(sectionField));

    return (
      <fieldset key={templateSection._id || templateSection.id}
        className="form__fields">
        {name}
        {fields}
      </fieldset>
    );
  }

  render() {
    const { form, formTemplate, full, error, session } = this.props;
    const { administrator, fieldsSet } = this.state;

    let formError;
    if (error && (typeof error === 'string' || error.error)) {
      formError = <FormError message={error} />;
    }

    const sections = (formTemplate.sections || [])
    .filter(section => (
      (!section.dependsOnId || fieldsSet[section.dependsOnId]) &&
      (!section.administrative || (full && administrator))
    ))
    .map(this._renderTemplateSection);

    let admin;
    if (full && administrator) {
      let added;
      if (form.created) {
        added = (
          <span className="secondary">
            First submitted {moment(form.created).format('MMM Do YYYY')}
          </span>
        );
      } else {
        added = <span />;
      }
      const formTemplatePath = `/form-templates/${formTemplate._id}`;

      let payments;
      if (form && form.paymentIds && form.paymentIds.length > 0) {
        payments = form.paymentIds.map(payment => (
          <Link key={payment._id} to={`/payments/${payment._id}/edit`}>
            payment
          </Link>
        ));
      } else {
        payments = <span />;
      }

      admin = (
        <fieldset className="form__fields">
          <div className="form__header">
            <h3>Administrative</h3>
            {added}
          </div>
          <FormField label="Person" help="the person to submit this form for">
            <SelectSearch category="users"
              options={{ select: 'name email', sort: 'name' }}
              Suggestion={UserSuggestion}
              value={(form.userId || session).name || ''}
              onChange={(suggestion) => {
                form.userId = suggestion;
                this.props.onChange(form);
              }} />
          </FormField>
          <div className="form__footer">
            {payments}
            <Link to={formTemplatePath}>template</Link>
          </div>
        </fieldset>
      );
    }

    let total;
    if (formTemplate.payable) {
      total = <FormTotal form={form} formTemplate={formTemplate} />;
    }

    return (
      <div className="form__contents">
        {formError}
        {sections}
        {total}
        {admin}
      </div>
    );
  }
}

FormContents.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  family: PropTypes.object,
  form: PropTypes.shape({
    fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  formTemplate: PropTypes.shape({
    sections: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  full: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
};

FormContents.defaultProps = {
  error: undefined,
  family: undefined,
};

const select = state => ({
  session: state.session,
});

export default Stored(FormContents, select);
