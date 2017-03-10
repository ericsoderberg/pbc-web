import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Markdown from 'markdown-to-jsx';
import { getItem, getItems } from '../../actions';
import FormField from '../../components/FormField';
import DateInput from '../../components/DateInput';
import SelectSearch from '../../components/SelectSearch';
import Stored from '../../components/Stored';

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

class PaymentFormContents extends Component {

  constructor() {
    super();
    this.state = { domains: [] };
  }

  componentDidMount() {
    const { formId, formTemplateId, formState, full, session } = this.props;
    const payment = formState.object;

    if (formTemplateId) {
      getItem('form-templates', formTemplateId)
      .then(formTemplate => this.setState({ formTemplate }))
      .catch(error => console.error(
        '!!! PaymentFormContents formTemplate catch', error));
    }

    if (formId) {
      getItem('forms', formId)
      .then(form => this.setState({ form }))
      .catch(error => console.error(
        '!!! PaymentFormContents form catch', error));
    }

    if (full && session.userId.administrator) {
      getItems('domains', { sort: 'name' })
      .then(domains => this.setState({ domains }))
      .catch(error => console.error('PaymentFormContents domains catch', error));

      if (payment._id) {
        getItems('forms', { filter: { paymentIds: payment._id } })
        .then(forms => this.setState({ forms }))
        .catch(error => console.error('PaymentFormContents forms catch', error));
      }
    } else if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }

    this._loadForms(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.formState.object._id !== this.props.formState.object._id) {
      this._loadForms(nextProps);
    }
  }

  _loadForms(props) {
    const { formState, full, session } = props;
    const payment = formState.object;

    if (full && session.userId.administrator && payment && payment._id) {
      getItems('forms', { filter: { paymentIds: payment._id } })
      .then(forms => this.setState({ forms }))
      .catch(error => console.error('PaymentFormContents forms catch', error));
    }
  }

  render() {
    const { className, formState, full, session } = this.props;
    const { form, forms, formTemplate } = this.state;
    const payment = formState.object;

    // const formFilter = { 'paymentId': payment._id };
    // const formFilterLabel = `Payment`;
    // const formsPath = `/forms?` +
    //   `filter=${encodeURIComponent(JSON.stringify(formFilter))}` +
    //   `&filter-name=${encodeURIComponent(formFilterLabel)}`;

    let checkInstructions;
    if (payment.method === 'check' && formTemplate) {
      checkInstructions = (
        <div className="form-field__text">
          <Markdown>{formTemplate.payByCheckInstructions || ''}</Markdown>
        </div>
      );
    }

    const administrator = (session &&
      (session.userId.administrator || (payment.domainId &&
        session.userId.administratorDomainId === payment.domainId)));

    let admin;
    if (full && administrator) {
      let processFields;
      if (payment._id) {
        processFields = [
          <FormField key="sent" label="Sent on">
            <DateInput value={payment.sent || ''}
              onChange={formState.change('sent')} />
          </FormField>,
          <FormField key="received" label="Received on">
            <DateInput value={payment.received || ''}
              onChange={formState.change('received')} />
          </FormField>,
        ];
      }

      let administeredBy;
      if (session.userId.administrator) {
        const domains = this.state.domains.map(domain => (
          <option key={domain._id} label={domain.name} value={domain._id} />
        ));
        domains.unshift(<option key={0} />);
        administeredBy = (
          <FormField label="Administered by">
            <select name="domainId" value={payment.domainId || ''}
              onChange={formState.change('domainId')}>
              {domains}
            </select>
          </FormField>
        );
      }

      let formLinks;
      if (forms && forms.length > 0) {
        const links = forms.map(form2 => (
          <Link key={form2._id} to={`/forms/${form2._id}/edit`}>form</Link>
        ));
        formLinks = (
          <div className="form__footer">
            {links}
          </div>
        );
      }

      admin = (
        <fieldset className="form__fields">
          <div className="form__header">
            <h3>Administrative</h3>
          </div>
          {processFields}
          <FormField label="Person" help="the person to submit this form for">
            <SelectSearch category="users"
              options={{ select: 'name email', sort: 'name' }}
              Suggestion={UserSuggestion}
              value={(payment.userId || session).name || ''}
              onChange={(suggestion) => {
                payment.userId = suggestion;
                this.props.onChange(payment);
              }} />
          </FormField>
          {administeredBy}
          {formLinks}
        </fieldset>
      );
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Amount">
            <div className="box--row">
              <span className="prefix">$</span>
              <input name="amount" type="text" disabled={!administrator}
                value={payment.amount || (form || {}).unpaidTotal || ''}
                onChange={formState.change('amount')} />
            </div>
          </FormField>
          <FormField label="Method">
            <div>
              <input id="methodPaypal" name="method" type="radio" value="paypal"
                checked={payment.method === 'paypal'}
                onChange={formState.change('method')} />
              <label htmlFor="methodPaypal">paypal</label>
            </div>
            <div>
              <input id="methodCheck" name="method" type="radio" value="check"
                checked={payment.method === 'check'}
                onChange={formState.change('method')} />
              <label htmlFor="methodCheck">check</label>
            </div>
            {checkInstructions}
          </FormField>
          <FormField label="Notes">
            <textarea name="notes" value={payment.notes || ''} rows={2}
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
  formState: PropTypes.object.isRequired,
  formId: PropTypes.string.isRequired,
  formTemplateId: PropTypes.string.isRequired,
  full: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
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
  full: true,
};

const select = state => ({
  session: state.session,
});

export default Stored(PaymentFormContents, select);
