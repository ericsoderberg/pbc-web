import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import Markdown from 'markdown-to-jsx';
import { loadCategory, unloadCategory, loadItem, unloadItem } from '../../actions';
import FormField from '../../components/FormField';
import DateInput from '../../components/DateInput';
import SelectSearch from '../../components/SelectSearch';

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

const FormSuggestion = props => (
  <div className="box--between">
    <span>{(props.item.formTemplateId || {}).name} {props.item.name}</span>
    <span className="secondary">
      {moment(props.item.modified).format('MMM Do YYYY')}
    </span>
  </div>
);

FormSuggestion.propTypes = {
  item: PropTypes.shape({
    formTemplateId: PropTypes.shape({
      name: PropTypes.string,
    }),
    modified: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
};

class PaymentFormContents extends Component {

  componentDidMount() {
    const { dispatch, form, formState, full, session } = this.props;

    if (full && session.userId.administrator) {
      dispatch(loadCategory('domains', { sort: 'name' }));
    } else if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }

    this._loadForms(this.props);

    if (form) {
      formState.addTo('formIds', form);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { formState } = nextProps;
    if (nextProps.formState.object._id !== this.props.formState.object._id) {
      this._loadForms(nextProps);
    }
    if (nextProps.form && !this.props.form) {
      formState.addTo('formIds', nextProps.form);
    }
  }

  componentWillUnmount() {
    const { dispatch, formId, full, session } = this.props;
    if (full && session.userId.administrator) {
      dispatch(unloadCategory('domains'));
      dispatch(unloadCategory('forms'));
      if (formId) {
        dispatch(unloadItem(formId));
      }
    }
  }

  _loadForms(props) {
    const { dispatch, formId, formState, full, session } = props;
    const payment = formState.object;

    if (full && session.userId.administrator && payment) {
      if (payment._id) {
        dispatch(loadCategory('forms',
          { filter: { paymentIds: payment._id }, populate: 'formTemplateId' }));
      } else if (formId) {
        dispatch(loadItem('forms', formId,
          { select: 'name formTemplateId', populate: 'formTemplateId' }));
      }
    }
  }

  render() {
    const {
      className, domains, forms, formState, full, payByCheckInstructions, session,
    } = this.props;
    const payment = formState.object;

    let method;
    if (payByCheckInstructions) {
      let checkInstructions;
      if (payment.method === 'check') {
        checkInstructions = (
          <div className="form-field__text">
            <Markdown>{payByCheckInstructions || ''}</Markdown>
          </div>
        );
      }
      method = (
        <FormField label="Method">
          <div className="box--row">
            <input id="methodPaypal"
              name="method"
              type="radio"
              value="paypal"
              checked={payment.method === 'paypal'}
              onChange={formState.change('method')} />
            <label htmlFor="methodPaypal">paypal</label>
          </div>
          <div className="box--row">
            <input id="methodCheck"
              name="method"
              type="radio"
              value="check"
              checked={payment.method === 'check'}
              onChange={formState.change('method')} />
            <label htmlFor="methodCheck">check</label>
          </div>
          {checkInstructions}
        </FormField>
      );
    }

    const administrator = (session &&
      (session.userId.administrator || (payment.domainId &&
        session.userId.administratorDomainId === payment.domainId)));

    let admin;
    if (full && administrator) {
      let administeredBy;
      if (session.userId.administrator) {
        const options = domains.map(domain => (
          <option key={domain._id} label={domain.name} value={domain._id} />
        ));
        options.unshift(<option key={0} />);
        administeredBy = (
          <FormField label="Administered by">
            <select name="domainId"
              value={payment.domainId || ''}
              onChange={formState.change('domainId')}>
              {options}
            </select>
          </FormField>
        );
      }

      let formItems;
      if (payment._id && forms && forms.length > 0) {
        const links = forms.map(form2 => (
          <Link key={form2._id} to={`/forms/${form2._id}/edit`}>
            {form2.formTemplateId.name} {form2.name}
          </Link>
        ));
        formItems = (
          <div className="form__footer">
            {links}
          </div>
        );
      } else if (!payment._id) {
        const form = (payment.formIds || [])[0];
        formItems = (
          <FormField label="Form">
            <SelectSearch category="forms"
              options={{
                select: 'name formTemplateId modified',
                populate: { path: 'formTemplateId', select: 'name' },
                sort: '-created',
              }}
              Suggestion={FormSuggestion}
              value={(form ?
                `${form.formTemplateId.name} ${form.name}` : '')}
              onChange={suggestion => formState.addTo('formIds', suggestion)()} />
          </FormField>
        );
      }

      admin = (
        <fieldset className="form__fields">
          <div className="form__header">
            <h3>Administrative</h3>
          </div>
          <FormField label="Sent on">
            <DateInput value={payment.sent || ''}
              onChange={formState.change('sent')} />
          </FormField>
          <FormField key="received" label="Received on">
            <DateInput value={payment.received || ''}
              onChange={formState.change('received')} />
          </FormField>
          <FormField label="Submitter" help="submit for this person">
            <SelectSearch category="users"
              options={{ select: 'name email', sort: 'name' }}
              Suggestion={UserSuggestion}
              value={(payment.userId || session).name || ''}
              onChange={suggestion => formState.set('userId', suggestion)} />
          </FormField>
          {administeredBy}
          {formItems}
        </fieldset>
      );
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Amount">
            <div className="box--row">
              <span className="prefix">$</span>
              <input name="amount"
                type="text"
                disabled={!administrator}
                value={payment.amount || ''}
                onChange={formState.change('amount')} />
            </div>
          </FormField>
          {method}
          <FormField label="Notes">
            <textarea name="notes"
              value={payment.notes || ''}
              rows={2}
              onChange={formState.change('notes')} />
          </FormField>
        </fieldset>
        {admin}
      </div>
    );
  }
}

PaymentFormContents.propTypes = {
  className: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  domains: PropTypes.array,
  form: PropTypes.object,
  formId: PropTypes.string,
  forms: PropTypes.array,
  formState: PropTypes.object.isRequired,
  payByCheckInstructions: PropTypes.string,
  full: PropTypes.bool,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
};

PaymentFormContents.defaultProps = {
  className: undefined,
  domains: [],
  form: undefined,
  formId: undefined,
  forms: undefined,
  full: true,
  payByCheckInstructions: undefined,
};

const select = (state, props) => ({
  domains: (state.domains || {}).items,
  form: props.formId ? state[props.formId] : undefined,
  forms: (state.forms || {}).items,
  session: state.session,
});

export default connect(select)(PaymentFormContents);
