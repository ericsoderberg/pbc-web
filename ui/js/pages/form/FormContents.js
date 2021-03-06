
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import FormError from '../../components/FormError';
import FormField from '../../components/FormField';
import SelectSearch from '../../components/SelectSearch';
import FormSuggestion from './FormSuggestion';
import FormTotal from './FormTotal';
import FormContentsSection from './FormContentsSection';
import { isFieldSet } from './FormUtils';

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
    this._onChangeField = this._onChangeField.bind(this);
    this.state = this._stateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this._stateFromProps(nextProps));
  }

  _stateFromProps(props) {
    const { form, formTemplate, session } = props;
    const fields = {};
    const options = {};
    form.fields.forEach((field) => {
      if (isFieldSet(field)) {
        fields[field.templateFieldId] = field;
        if (field.optionId) {
          options[field.optionId] = field.optionId;
        }
        if (field.optionIds) {
          field.optionIds.forEach((optionId) => {
            options[optionId] = optionId;
          });
        }
      }
    });
    const administrator = (session &&
      (session.userId.administrator || (
        (formTemplate && formTemplate.domainId &&
        session.userId.domainIds.some(id => id === formTemplate.domainId)))));
    return { administrator, fields, options };
  }

  _onChangeField(field) {
    const form = { ...this.props.form };
    const fields = form.fields.slice(0);

    let index = -1;
    fields.some((f, i) => {
      if (f.templateFieldId === field.templateFieldId) {
        index = i;
      }
      return index !== -1;
    });

    if (!isFieldSet(field)) {
      // field has no value, remove it
      if (index !== -1) {
        fields.splice(index, 1);
      }
    } else if (index === -1) {
      fields.push(field);
    } else {
      fields[index] = field;
    }
    form.fields = fields;

    this.props.onChange(form);
  }

  render() {
    const {
      form, formTemplate, full, error, kiosk, linkedForm, linkedFormControl, session,
    } = this.props;
    const { administrator, fields, options } = this.state;

    let formError;
    if (error) {
      formError = <FormError error={error} />;
    }

    const sections = (formTemplate.sections || [])
      .filter(section => (
        (!section.dependsOnId || fields[section.dependsOnId] ||
          options[section.dependsOnId]) &&
        (!section.administrative || (full && administrator))
      ))
      .map(section => (
        <FormContentsSection key={section._id || section.id}
          formTemplateSection={section}
          fields={fields}
          options={options}
          linkedForm={linkedForm}
          linkedFormControl={linkedFormControl}
          error={error}
          onChange={this._onChangeField} />
      ));

    let admin;
    if (full && administrator && !kiosk) {
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
      } else if (formTemplate.payable) {
        payments =
          <Link to={`/payments/add?formId=${form._id}`}>Add payment</Link>;
      } else {
        payments = <span />;
      }

      let linkTo;
      if (formTemplate.linkedFormTemplateId && !linkedForm) {
        // allow admin to link this form to a form from the linkedFormTemplate
        linkTo = (
          <FormField label="Linked form">
            <SelectSearch category="forms"
              options={{
                filter: { formTemplateId: formTemplate.linkedFormTemplateId },
                select: 'name formTemplateId modified',
                populate: { path: 'formTemplateId', select: 'name' },
                sort: '-created',
              }}
              Suggestion={FormSuggestion}
              value={((form.linkedFormId && form.linkedFormId.formTemplateId) ?
                `${form.linkedFormId.formTemplateId.name} ${form.linkedFormId.name}` : '')}
              onChange={(suggestion) => {
                const nextForm = { ...form };
                nextForm.linkedFormId = suggestion;
                this.props.onChange(nextForm);
              }} />
          </FormField>
        );
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
                const nextForm = { ...form };
                nextForm.userId = suggestion;
                this.props.onChange(nextForm);
              }} />
          </FormField>
          {linkTo}
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
  form: PropTypes.shape({
    fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  formTemplate: PropTypes.shape({
    sections: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  full: PropTypes.bool.isRequired,
  kiosk: PropTypes.bool,
  linkedForm: PropTypes.object,
  linkedFormControl: PropTypes.element,
  onChange: PropTypes.func.isRequired,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      domainIds: PropTypes.arrayOf(PropTypes.string),
      name: PropTypes.string,
    }),
  }),
};

FormContents.defaultProps = {
  error: undefined,
  kiosk: false,
  linkedForm: undefined,
  linkedFormControl: undefined,
  session: undefined,
};

const select = state => ({
  session: state.session,
});

export default connect(select)(FormContents);
